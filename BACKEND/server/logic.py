import json
import base64
import os
import logging

logger = logging.getLogger(__name__)

# Blockchain connection (optional - gracefully handles when unavailable)
contract = None
BLOCKCHAIN_AVAILABLE = False

BLOCKCHAIN_RPC = os.getenv('BLOCKCHAIN_RPC_URL', 'http://127.0.0.1:7545')
BLOCKCHAIN_FROM_ADDRESS = os.getenv('BLOCKCHAIN_FROM_ADDRESS', '0xe66477CaBAe9AFC35E421Ea5db5D3C2D2CC52708')
BLOCKCHAIN_CONTRACT_ADDRESS = os.getenv('BLOCKCHAIN_CONTRACT_ADDRESS', '0xBcbaCf69790d1Fe332b26215EE2C9A308f84A247')

try:
    from web3 import Web3
    webs = Web3(Web3.HTTPProvider(BLOCKCHAIN_RPC))
    one = {"from": BLOCKCHAIN_FROM_ADDRESS}

    # Try to load contract ABI
    contract_json_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "Blocks", "build", "contracts", "Store.json"
    )
    if os.path.exists(contract_json_path):
        with open(contract_json_path) as d:
            contract = webs.eth.contract(
                address=BLOCKCHAIN_CONTRACT_ADDRESS, abi=json.load(d)["abi"]
            ).functions
        if webs.is_connected():
            BLOCKCHAIN_AVAILABLE = True
            logger.info(f"✅ Blockchain connected at {BLOCKCHAIN_RPC}")
        else:
            logger.warning(f"⚠️ Blockchain node not reachable at {BLOCKCHAIN_RPC}")
    else:
        logger.warning(f"⚠️ Contract ABI file not found at {contract_json_path}")
except ImportError:
    logger.warning("⚠️ web3 not installed — blockchain features disabled")
except Exception as e:
    logger.warning(f"⚠️ Blockchain init failed (non-fatal): {e}")


def addData(data: dict) -> str:
    """Add data to blockchain. Returns 'Success' or error string."""
    if not BLOCKCHAIN_AVAILABLE or contract is None:
        return "Blockchain unavailable"
    try:
        encoded = base64.b64encode(json.dumps(data).encode()).decode()
        contract.addString(encoded).transact(one)
        return "Success"
    except Exception as e:
        logger.error(f"Blockchain addData error: {e}")
        return str(e)


def retriveData() -> list:
    """Retrieve all data from blockchain. Returns empty list on failure."""
    ff = []
    if not BLOCKCHAIN_AVAILABLE or contract is None:
        return ff
    try:
        view = contract.getAll().call(one)
        for i in view:
            dd = json.loads(base64.b64decode(i[1]).decode())
            dd['id'] = i[0]
            ff.append(dd)
        return ff
    except Exception as _:
        return ff


def updateViewPoint(id: int, dd: dict) -> str:
    """Update data in blockchain by ID."""
    if not BLOCKCHAIN_AVAILABLE or contract is None:
        return "Blockchain unavailable"
    try:
        for i in retriveData():
            if i['id'] == id:
                try:
                    del dd['id']
                except Exception:
                    pass
                contract.updateStore(
                    id, base64.b64encode(json.dumps(dd).encode()).decode()
                ).transact(one)
                return "Success"
        return "Failed to Updated"
    except Exception as e:
        return "Not Updated"