from web3 import Web3

# connect to blockchain
web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

# contract address from Remix
contract_address = "0xd9145CCE52D386f254917e481eB44e9943F39138"

# ABI from Remix
abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_prompt",
				"type": "string"
			}
		],
		"name": "addPrompt",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getPrompt",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "prompts",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

# connect to contract
contract = web3.eth.contract(address=contract_address, abi=abi)