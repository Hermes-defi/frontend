import PlutusTokenABI from "config/abis/PlutusToken.json";
import MasterChefABI from "config/abis/MasterChef.json";
import ReferralABI from "config/abis/Referral.json";
import FenixABI from "config/abis/Fenix.json";
import RedeemABI from "config/abis/Redeem.json";
import ERC20ABI from "config/abis/ERC20.json";
import UNIPAIRABI from "config/abis/UNIPAIR.json";
import StakePoolABI from "config/abis/StakePool.json";
import VaultABI from "config/abis/Vault.json";
import DfynFarmABI from "config/abis/DfynFarm.json";
import HermesNFTABI from "config/abis/HermesNFT.json";
import pAPOLLO from "config/abis/pApollo.json";
import ApolloABI from "config/abis/ApolloABI.json";
import { DEFAULT_CHAIN_ID } from "config/constants";

export type ContractInfo = {
  address: string;
  abi: any;
};

export const erc20: (address: string) => ContractInfo = (address: string) => ({
  abi: ERC20ABI,
  address,
});

export const uniPair: (address: string) => ContractInfo = (address: string) => ({
  abi: UNIPAIRABI,
  address,
});

export const stakePool: (address: string) => ContractInfo = (address: string) => ({
  abi: StakePoolABI,
  address,
});

export const vault: (address: string) => ContractInfo = (address: string) => ({
  abi: VaultABI,
  address,
});

export const dfynFarm: (address: string) => ContractInfo = (address: string) => ({
  abi: DfynFarmABI,
  address,
});

const defaultContracts = {
  referral: {
    address: {
      1666600000: "0xDC99FE88118CdE8316df10Eb16c722C3967e73Fd",
      1666700001: "0x8295CCCA26e2e4396061515B0b72731BDf5796C1",
    }[DEFAULT_CHAIN_ID],
    abi: ReferralABI,
  },
  masterChef: {
    address: {
      1666600000: "0x4aA8DeF481d19564596754CD2108086Cf0bDc71B",
      1666700001: "0xA3dc6b430A90D61e7f1C7800d43Bd67b8a06D597",
    }[DEFAULT_CHAIN_ID],
    abi: MasterChefABI,
  },
  plutusToken: {
    address: {
      1666600000: "0xe5dFCd29dFAC218C777389E26F1060E0D0Fe856B",
      1666700001: "",
    }[DEFAULT_CHAIN_ID],
    abi: PlutusTokenABI,
  },
  apolloToken: {
    address: {
      1666600000: "0x577aa684b89578628941d648f1fbd6dde338f059",
      1666700001: "",
    }[DEFAULT_CHAIN_ID],
    abi: ApolloABI,
  },
  fenixToken: {
    address: {
      1666600000: "0x41013D1521B20CA67397e7c65256bfb2975FAAc8",
      1666700001: "0x807Be9676f72390bCaB19f914f770d9713a2d9e0",
    }[DEFAULT_CHAIN_ID],
    abi: FenixABI,
  },
  redeem: {
    address: {
      1666600000: "0x0C72A971AB0D85689bDd95810BE54dD0C3aB3Ab3",
      1666700001: "0xC481Cc926522A14Ed21077B8eEd85c7C0947F62e",
    }[DEFAULT_CHAIN_ID],
    abi: RedeemABI,
  },
  hermesNft: {
    address: {
      1666600000: "0x6011b77d2dcba999f837d6609124fbcdc4ac3a4e",
      1666700001: "",
    }[DEFAULT_CHAIN_ID],
    abi: HermesNFTABI,
  },
  apolloPresaleFirstRound: {
    address: {
      1666600000: "0xF8459eF698f7C6F6C2a5D80a80f92C8Ae6535d6E",
      1666700001: "",
    }[DEFAULT_CHAIN_ID],
    abi: pAPOLLO,
  },
  apolloPresaleSecondRound: {
    address: {
      1666600000: "0xe08fA8F2b3531e82a6Bef397C5FA64c5d9d7B889",
      1666700001: "",
    }[DEFAULT_CHAIN_ID],
    abi: pAPOLLO,
  },
  pApollo: {
    address: {
      1666600000: "0xE644Be5D4d5E7f16F0039cD67BCd438D1A62ef13",
      1666700001: "",
    }[DEFAULT_CHAIN_ID],
    abi: ERC20ABI,
  },
};

export default defaultContracts;
