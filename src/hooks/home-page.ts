import BigNumberJS from "bignumber.js";
import defaultContracts from "config/contracts";
import ReactGA from "react-ga";
import dayjs from "dayjs";

import { BURN_ADDRESS } from "config/constants";
import { Pool, pools } from "config/pools";
import { BigNumber, constants, utils } from "ethers";
import { useMasterChef, usePlutusToken, useERC20 } from "hooks/contracts";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useActiveWeb3React } from "wallet";
import { useToast } from "@chakra-ui/react";
import { usePlutusPrice } from "hooks/prices";
import { useFetchFarms } from "state/farms";
import { useFetchVaults } from "state/vaults";
import { Farm, farms } from "config/farms";
import { Vault } from "config/vaults";
import { useFetchPools } from "state/pools";
import { useFetchBalancers } from "state/balancers";
import { Balancer, balancers } from "config/balancers";

export function usePlutusData() {
  const { account } = useActiveWeb3React();
  const masterChef = useMasterChef();
  const plutusToken = usePlutusToken();

  const plutusInWallet = useQuery("plutusInWallet", async () => {
    return account ? utils.formatEther(await plutusToken.balanceOf(account)) : "0.00";
  });

  const plutusToHarvest = useQuery("plutusToHarvest", async () => {
    const totalPlutusToHarvest = [...farms, ...pools, ...balancers].reduce(async (_total, pool) => {
      const total = await _total;
      const plutusEarned = await masterChef.pendingApollo(pool.pid, account); // TODO: shouldn be pendingPlutus instead?
      return total.add(plutusEarned);
    }, Promise.resolve(BigNumber.from(0)));

    return account ? utils.formatEther(await totalPlutusToHarvest) : "0.00";
  });

  return { plutusInWallet, plutusToHarvest };
}

export function usePlutusStats() {
  const plutusContract = usePlutusToken();
  const plutusPrice = usePlutusPrice();
  
  //TODO: get plutus_per_block
  const plutusStats = useQuery({
    enabled: !!plutusPrice.data,
    refetchInterval: 0.5 * 60 * 1000,
    queryKey: ["plutusStats", plutusPrice.data],
    queryFn: async () => {
      const maximumSupply = 3_000_000;
      const totalMinted = (await plutusContract.totalSupply()) as BigNumber;
      const totalBurned = (await plutusContract.balanceOf(BURN_ADDRESS)) as BigNumber;
      const circulatingSupply = totalMinted.sub(totalBurned);

      let marketCap = "N/A";
      if (plutusPrice) {
        // convert circulating supply to real price
        const circulatingSupplyInPlutus = utils.formatEther(circulatingSupply);
        marketCap = new BigNumberJS(circulatingSupplyInPlutus).multipliedBy(plutusPrice.data).toString();
      }

      return {
        maximumSupply,
        marketCap,
        totalMinted: utils.formatEther(totalMinted),
        totalBurned: utils.formatEther(totalBurned),
        circulatingSupply: utils.formatEther(circulatingSupply),
      };
    },
  });

  return plutusStats;
}

export function useFarmAPRStats() {
  const farmsResp = useFetchFarms();
  const isLoading = farmsResp.every((f) => f.status === "loading");

  const aprs = farmsResp.map((f) => (f.data as Farm)?.apr.yearlyAPR);
  const maxApr = aprs.reduce( (accum, apr) => ( apr > accum ? apr : accum ), 0 );

  return [isLoading, maxApr];
}

export function usePoolsAPRStats() {
  const poolsResp = useFetchPools();
  const isLoading = poolsResp.every((p) => p.status === "loading");

  const aprs = poolsResp.map((p) => (p.data as Pool)?.apr.yearlyAPR);
  const maxApr = aprs.reduce( (accum, apr) => ( apr > accum ? apr : accum ), 0 );

  return [isLoading, maxApr];
}

export function useTotalInVaults() {
  const vaultsResp = useFetchVaults();
  const isLoading = vaultsResp.every((f) => f.status === "loading");

  const data = vaultsResp.reduce((total, vaultResp) => {
    const vault = vaultResp.data as Vault;
    if (!vault) return new BigNumberJS(0);

    const totalLockedInVaults = new BigNumberJS(vault?.totalStaked).multipliedBy(vault?.stakeToken.price);

    return total.plus(totalLockedInVaults);
  }, new BigNumberJS(0));

  return {
    data,
    isLoading,
  };
}

export function useTotalInFarms() {
  const farmsResp = useFetchFarms();
  const isLoading = farmsResp.every((f) => f.status === "loading");

  const data = farmsResp.reduce((total, farmResp) => {
    const farm = farmResp.data as Farm;
    if (!farm) return new BigNumberJS(0);

    const totalLockedInFarm = new BigNumberJS(farm?.totalStaked).multipliedBy(farm?.stakeToken.price);

    return total.plus(totalLockedInFarm);
  }, new BigNumberJS(0));

  return {
    data,
    isLoading,
  };
}

export function useTotalInPools() {
  const poolsResp = useFetchPools();
  const isLoading = poolsResp.every((f) => f.status === "loading");

  const data = poolsResp.reduce((total, poolResp) => {
    const pool = poolResp.data as Pool;
    if (!pool) return new BigNumberJS(0);

    const totalLockedInFarm = new BigNumberJS(pool?.totalStaked).multipliedBy(pool?.stakeToken.price);

    return total.plus(totalLockedInFarm);
  }, new BigNumberJS(0));

  return {
    data,
    isLoading,
  };
}

export function useTotalInBalancers() {
  const balsResp = useFetchBalancers();
  const isLoading = balsResp.every((f) => f.status === "loading");

  const data = balsResp.reduce((total, balResp) => {
    const bal = balResp.data as Balancer;
    if (!bal) return new BigNumberJS(0);

    const totalLockedInFarm = new BigNumberJS(bal?.totalStaked).multipliedBy(bal?.stakeToken.price);

    return total.plus(totalLockedInFarm);
  }, new BigNumberJS(0));

  return {
    data,
    isLoading,
  };
}

export function useTvlChart() {
  return useQuery("tvl-chart-data", async () => {
    const resp = await fetch("/api/tvl-chart");
    const data = await resp.json() || [];

    // format data
    return data.map( ( tvlData: { value: string; time: string } ) => {
      const time = dayjs( tvlData.time ).format( "HH:mm" );
      const value = parseInt( tvlData.value );

      return { time, value };
    } );
  });
}

export function useLandingPageStats() {
  return useQuery("landing-page-stats", async () => {
    const resp = await fetch("/api/stats");
    const data = await resp.json();

    const totalTvl = new BigNumberJS(data?.plutus?.tvl).plus(data?.iris?.tvl).toString();
    return {
      ...data,
      totalTvl,
    };
  });
}

export function useHarvestAll(plutusToHarvest: string) {
  const { account } = useActiveWeb3React();
  const queryClient = useQueryClient();
  const masterChef = useMasterChef();
  const getLpContract = useERC20();
  const toast = useToast();

  const harvestAll = useMutation(
    async () => {
      return Promise.all(
        [...farms, ...pools, ...balancers].map(async (pool) => {
          const lpContract = getLpContract(pool.stakeToken.address);
          const allowance: BigNumber = await lpContract.allowance(account, defaultContracts.masterChef.address);

          const hasApprovedPool = !allowance.isZero();

          if (!hasApprovedPool) return;

          const tx = await masterChef.deposit(pool.pid, utils.parseEther("0"), constants.AddressZero);
          await tx.wait();
        })
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("plutusInWallet");
        queryClient.invalidateQueries("plutusToHarvest");

        ReactGA.event({
          category: "Withdrawals",
          action: `Withdrawing from all pools and farms`,
          value: parseInt(plutusToHarvest, 10),
        });
      },

      onError: ({ message, data }) => {
        toast({
          status: "error",
          position: "top-right",
          title: "Error harvesting PLUTUS",
          description: data?.message || message,
          isClosable: true,
        });
      },
    }
  );

  return harvestAll;
}
