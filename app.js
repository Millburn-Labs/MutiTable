import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { 
    makeContractCall, 
    broadcastTransaction, 
    AnchorMode,
    PostConditionMode,
    stringAsciiCV,
    callReadOnlyFunction,
    cvToJSON
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

// Configuration
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksTestnet();

// Replace with your deployed contract address
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // UPDATE THIS
const CONTRACT_NAME = 'table';

// Initialize UI
function init() {
    const connectBtn = document.getElementById('connectBtn');
    const walletStatus = document.getElementById('walletStatus');
    const markBtn = document.getElementById('markBtn');
    const checkBtn = document.getElementById('checkBtn');
    const markStatus = document.getElementById('markStatus');
    const checkStatus = document.getElementById('checkStatus');

    // Check if already connected
    if (userSession.isUserSignedIn()) {
        updateWalletStatus(true);
    }

    // Connect wallet
    connectBtn.addEventListener('click', async () => {
        showConnect({
            appDetails: {
                name: 'Student Attendance',
                icon: window.location.origin + '/favicon.ico'
            },
            onFinish: () => {
                updateWalletStatus(true);
            },
            userSession
        });
    });

    function updateWalletStatus(connected) {
        if (connected) {
            const userData = userSession.loadUserData();
            walletStatus.textContent = `Connected: ${userData.profile.stxAddress.testnet}`;
            walletStatus.style.display = 'block';
            walletStatus.className = 'status success';
            connectBtn.textContent = 'Disconnect';
            connectBtn.onclick = () => {
                userSession.signUserOut();
                updateWalletStatus(false);
            };
            markBtn.disabled = false;
        } else {
            walletStatus.style.display = 'none';
            connectBtn.textContent = 'Connect Wallet';
            markBtn.disabled = true;
        }
    }

    // Mark attendance
    markBtn.addEventListener('click', async () => {
        const studentName = document.getElementById('studentName').value.trim();
        const date = document.getElementById('date').value.trim();

        if (!studentName || !date) {
            markStatus.innerHTML = '<div class="status error">Please fill in both fields</div>';
            return;
        }

        try {
            markStatus.innerHTML = '<div class="status info">Processing...</div>';

            const functionArgs = [
                stringAsciiCV(studentName),
                stringAsciiCV(date)
            ];

            const txOptions = {
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'mark-attendance',
                functionArgs,
                senderKey: userSession.loadUserData().appPrivateKey,
                network,
                anchorMode: AnchorMode.Any,
                postConditionMode: PostConditionMode.Allow,
                fee: 1000,
            };

            const transaction = await makeContractCall(txOptions);
            const broadcastResponse = await broadcastTransaction(transaction, network);
            
            markStatus.innerHTML = `<div class="status success">Attendance marked! TX: ${broadcastResponse.txid}</div>`;
        } catch (error) {
            markStatus.innerHTML = `<div class="status error">Error: ${error.message}</div>`;
        }
    });

    // Check attendance
    checkBtn.addEventListener('click', async () => {
        const studentName = document.getElementById('checkStudentName').value.trim();
        const date = document.getElementById('checkDate').value.trim();

        if (!studentName || !date) {
            checkStatus.innerHTML = '<div class="status error">Please fill in both fields</div>';
            return;
        }

        try {
            checkStatus.innerHTML = '<div class="status info">Checking...</div>';

            const functionArgs = [
                stringAsciiCV(studentName),
                stringAsciiCV(date)
            ];

            const result = await callReadOnlyFunction({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'check-attendance',
                functionArgs,
                network,
                senderAddress: CONTRACT_ADDRESS
            });

            const json = cvToJSON(result);
            const isPresent = json.value.value;

            if (isPresent) {
                checkStatus.innerHTML = '<div class="status success">✓ Student was present</div>';
            } else {
                checkStatus.innerHTML = '<div class="status error">✗ Student was not present</div>';
            }
        } catch (error) {
            checkStatus.innerHTML = `<div class="status error">Error: ${error.message}</div>`;
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
