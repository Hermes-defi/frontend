import React from "react";
import { useState } from "react";
import { UseMutationResult } from "react-query";

import { displayTokenCurrency } from "libs/utils";
import { useActiveWeb3React } from "wallet";

import {
  useDisclosure,
  Button,
  Stack,
  Box,
  Text,
  HStack,
  Input,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
// import * as Slider from "@radix-ui/react-slider";

import { UnlockButton } from "components/wallet/unlock-wallet";
import BigNumberJS from "bignumber.js";

import { DepositModal } from "components/modals/deposit-modal";
import { WithdrawModal } from "components/modals/withdraw-modal";
import { useTokenBalance } from "hooks/wallet";
import { FaDollarSign } from "react-icons/fa";
import { vault } from "config/contracts";
import { Label } from "recharts";

type IDepositProps = {
  primary?: boolean;

  id: number | string;
  stakeToken: {
    symbol: string;
    address: string;
    decimals: number;
  };

  deposit: UseMutationResult;
};
const DepositButton: React.FC<IDepositProps> = (props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [amount, setAmount] = useState("");
  return (
    <>
      <Button
        size="md"
        bg={props.primary ? "primary.600" : "gray.700"}
        _hover={{ bg: props.primary ? "primary.500" : "gray.600" }}
        onClick={onOpen}
        w={["36", "48"]}
      >
        {props.children}
      </Button>

      <DepositModal
        isOpen={isOpen}
        onClose={onClose}
        token={props.stakeToken.symbol}
        tokenAddress={props.stakeToken.address}
        tokenDecimals={props.stakeToken.decimals}
        isLoading={props.deposit.isLoading}
        onDeposit={(amount: string) =>
          props.deposit
            .mutateAsync({ amount, id: props.id })
            .then(() => onClose())
        }
      />
    </>
  );
};

type IUnstakeProps = {
  primary?: boolean;

  id: string | number;
  hasWithdrawAll?: boolean;
  userTotalStaked: string;
  stakeToken: {
    symbol: string;
  };

  withdraw: UseMutationResult;
  withdrawAll?: UseMutationResult;
};
const UnstakeButton: React.FC<IUnstakeProps> = (props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button
        size="sm"
        bg={"gray.700"}
        _hover={{ bg: "gray.600" }}
        onClick={onOpen}
        w="sm"
      >
        {props.children}
      </Button>

      <WithdrawModal
        isOpen={isOpen}
        onClose={onClose}
        hasWithdrawAll={props.hasWithdrawAll}
        token={props.stakeToken.symbol}
        tokenBalance={props.userTotalStaked}
        isLoading={props.withdraw.isLoading}
        onWithdrawAll={() =>
          props.withdrawAll.mutateAsync({ id: props.id }).then(() => onClose())
        }
        onWithdraw={(amount: string) =>
          props.withdraw
            .mutateAsync({ amount, id: props.id })
            .then(() => onClose())
        }
      />
    </>
  );
};

type IProps = {
  id: number | string;
  canCompound: boolean;
  disableRewards?: boolean;
  hasWithdrawAll?: boolean;

  rewardToken: {
    symbol: string;
  };

  stakeToken: {
    symbol: string;
    address: string;
    decimals: number;
  };

  unstakeToken?: {
    symbol: string;
    address: string;
    decimals: number;
  };

  rewardsEarned?: string;
  hasApprovedPool: boolean;
  userTotalStaked: string;
  userAvailableToUnstake?: string;

  approve: UseMutationResult;
  deposit: UseMutationResult;
  withdraw: UseMutationResult;
  withdrawAll?: UseMutationResult;
  harvest?: UseMutationResult;
  compound?: UseMutationResult;
};
export const UserSectionAlt: React.FC<IProps> = (props) => {
  const { account } = useActiveWeb3React();
  const balance = useTokenBalance(
    props.stakeToken.address,
    props.stakeToken.decimals
  );
  const [depositValue, setDepositValue] = useState(0);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [withdrawValue, setWithdrawValue] = useState(0);
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!account) {
    return (
      <Stack align="center">
        <Text fontSize="md" mb={5}>
          Connect your wallet to access the vault
        </Text>
        <UnlockButton
          boxShadow="md"
          w={["100%", "50%"]}
          h={["4rem", "5rem"]}
          fontSize={["lg", "xl"]}
          colorScheme="accent"
        />
      </Stack>
    );
  }

  return (
    <Stack direction={["column", "column", "row"]} justify="space-between">
      {/* DEPOSIT SIDE */}
      <Box align="left">
        <HStack align="center">
          <Text mb={1} fontWeight="400" fontSize="xs">
            Balance:
          </Text>
          <Text fontWeight="700" fontSize="xl">
            {balance ? displayTokenCurrency(balance, "") : "N/A"}
          </Text>
        </HStack>

        <Stack h="7rem" w={["100%", "100%", "sm"]}>
          <InputGroup>
            <InputRightElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
              children="$"
            />
            <Input
              focusBorderColor="secondary.500"
              placeholder={"0.0"}
              type="number"
              onChange={(depositValue) =>
                setDepositValue(
                  new BigNumberJS(depositValue.target.value).toNumber()
                )
              }
              value={depositValue}
            />
          </InputGroup>
          <Slider
            aria-label="deposit-slider"
            defaultValue={50}
            min={0}
            max={100}
            value={depositPercentage}
            onChange={(depositPercentage) => {
              setDepositPercentage(depositPercentage);
              setDepositValue(
                new BigNumberJS(balance)
                  .times(depositPercentage)
                  .div(100)
                  .toNumber()
              );
            }}
          >
            {console.log("deposit", depositPercentage)}
            {console.log("value", depositValue)}
            <SliderMark value={0} mt="7" ml="-2.5" fontSize="xx-small">
              0%
            </SliderMark>
            <SliderMark value={25} mt="7" ml="-2.5" fontSize="xx-small">
              25%
            </SliderMark>
            <SliderMark value={50} mt="7" ml="-2.5" fontSize="xx-small">
              50%
            </SliderMark>
            <SliderMark value={75} mt="7" ml="-2.5" fontSize="xx-small">
              75%
            </SliderMark>
            <SliderMark value={100} mt="7" ml="-2.5" fontSize="xx-small">
              100%
            </SliderMark>
            <SliderTrack mt={5} boxSize="1.5" bg="pink.100">
              <SliderFilledTrack
                bgGradient={`linear(to-l,green.500, green.100)`}
              />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg="blue.400"
              color="white"
              placement="top"
              label={`${depositPercentage}%`}
            >
              <SliderThumb mt={5} boxSize={4}></SliderThumb>
            </Tooltip>
          </Slider>
        </Stack>
        <Stack
          align="center"
          justify="space-between"
          mt="8"
          w={["100%", "100%", "sm"]}
        >
          <Stack direction="row">
            {!props.hasApprovedPool && (
              <Button
                size="md"
                isLoading={props.approve.isLoading}
                onClick={() => props.approve.mutate(props.id)}
                bg="gray.700"
                boxShadow="lg"
                _hover={{ bg: "gray.600" }}
                w={["36", "48"]}
              >
                Approve
              </Button>
            )}

            {props.hasApprovedPool ? (
                
                <Button
                isDisabled={balance === '0.0' ? true : false}
                  isLoading={props.deposit.isLoading}
                  onClick={() =>
                    props.deposit.mutateAsync({ amount: depositValue.toString(), id: props.id })
                  }
                  size="md"
                  bg={"gray.700"}
                  _hover={{ bg: "gray.600" }}
                  w={["36", "48"]}
                >
                  Stake
                </Button>
              ):
              <>
              </>
              }
              {console.log(balance)}
          </Stack>
        </Stack>
      </Box>

      {/* WITHDRAW SIDE */}

      <Box align="left">
        <HStack align="center">
          <Text mb={1} fontWeight="400" fontSize="xs">
            Staked:
          </Text>
          <Text fontWeight="700" fontSize="xl">
            {props.userTotalStaked ? displayTokenCurrency(balance, "") : "N/A"}
          </Text>
        </HStack>
        <Stack h="7rem" w={["100%", "100%", "sm"]}>
          <InputGroup>
            <InputRightElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
              children="$"
            />
            <Input
              focusBorderColor="secondary.500"
              placeholder={"0.0"}
              type="number"
              onChange={(withdrawValue) =>
                setWithdrawValue(
                  new BigNumberJS(withdrawValue.target.value).toNumber()
                )
              }
              value={withdrawValue}
            />
          </InputGroup>
          <Slider
            aria-label="withdraw-slider"
            defaultValue={0}
            min={0}
            max={100}
            value={withdrawPercentage}
            onChange={(withdrawPercentage) => {
              setWithdrawPercentage(withdrawPercentage);
              setWithdrawValue(
                new BigNumberJS(withdrawPercentage)
                  .times(props.userTotalStaked)
                  .div(100)
                  .toNumber()
              );
            }}
          >
            {console.log("withdraw", withdrawPercentage)}
            {console.log("value", withdrawValue)}
            <SliderMark value={0} mt="7" ml="-2.5" fontSize="xx-small">
              0%
            </SliderMark>
            <SliderMark value={25} mt="7" ml="-2.5" fontSize="xx-small">
              25%
            </SliderMark>
            <SliderMark value={50} mt="7" ml="-2.5" fontSize="xx-small">
              50%
            </SliderMark>
            <SliderMark value={75} mt="7" ml="-2.5" fontSize="xx-small">
              75%
            </SliderMark>
            <SliderMark value={100} mt="7" ml="-2.5" fontSize="xx-small">
              100%
            </SliderMark>

            <SliderTrack mt={5} boxSize="1.5" bg="pink.100">
              <SliderFilledTrack
                bgGradient={`linear(to-l, pink.400, green.200)`}
              />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg="blue.400"
              color="white"
              placement="top"
              label={`${withdrawPercentage}%`}
            >
              <SliderThumb mt={5} boxSize={4}></SliderThumb>
            </Tooltip>
          </Slider>
        </Stack>
        <Stack
          direction={["column", "row"]}
          align="center"
          justify="space-evenly"
          mt={["4", "8"]}
          w={["100%", "100%", "sm"]}
        >
          {
            <>
              <Button
              isDisabled={withdrawValue === 0 ? true : false}
                size="md"
                bg={"gray.700"}
                _hover={{ bg: "gray.600" }}
                w={["36", "48"]}
                onClick={() =>
                  props.withdraw.mutateAsync({ amount: withdrawValue.toString(), id: props.id })}
              >
                Withdraw
              </Button>
              <Button
                isDisabled={withdrawValue === 0 ? true : false}
                size="md"
                bg={"gray.700"}
                _hover={{ bg: "gray.600" }}
                onClick={() =>
                  props.withdrawAll.mutateAsync({ id: props.id })}
                w={["36", "48"]}
              >
                Withdraw All
              </Button>
              {/* <UnstakeButton
                  id={props.id}
                  hasWithdrawAll={props.hasWithdrawAll}
                  stakeToken={props.unstakeToken || props.stakeToken}
                  userTotalStaked={
                    props.userAvailableToUnstake || props.userTotalStaked
                  }
                  withdraw={props.withdraw}
                  withdrawAll={props.withdrawAll}
                >
                  Withdraw
                </UnstakeButton> */}
            </>
          }
        </Stack>
      </Box>
      {!props.disableRewards && (
        <Box align="left">
          <Text mb={1} fontWeight="600" fontSize="sm">
            {props.rewardToken.symbol} Earned
          </Text>

          <Stack align="center" direction="row" justify="space-between">
            <Text fontWeight="700" fontSize="2xl">
              {props.rewardsEarned
                ? displayTokenCurrency(props.rewardsEarned, "")
                : "N/A"}
            </Text>

            {props.hasApprovedPool && (
              <Stack direction="row">
                <Button
                  isLoading={props.harvest.isLoading}
                  onClick={() =>
                    props.harvest.mutate({ id: props.id, amount: "0" })
                  }
                  size="xs"
                  bg="gray.700"
                  _hover={{ bg: "gray.600" }}
                >
                  Harvest
                </Button>

                {props.canCompound && (
                  <Button
                    isLoading={props.compound?.isLoading}
                    onClick={() =>
                      props.compound?.mutate({
                        id: props.id,
                        amount: props.rewardsEarned,
                      })
                    }
                    size="xs"
                    bg="gray.700"
                    _hover={{ bg: "gray.600" }}
                  >
                    Compound
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};
