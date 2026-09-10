import { useState } from "react";
import type { CalendarDate } from "@internationalized/date";
import {
  ArrowLeft01Icon,
  GiftIcon,
  LockIcon,
} from "@hugeicons/core-free-icons";
import { isAddress, parseUnits, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { Link } from "react-router-dom";
import {
  useAccount,
  useConnect,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { Button } from "../../components/base/buttons/button";
import { DatePicker } from "../../components/base/date-picker/date-picker";
import { InputBase, TextField } from "../../components/base/input/input";
import { Label } from "../../components/base/input/label";
import { Select, SelectItem } from "../../components/base/select/select";
import { Brand, Icon } from "../../components/Brand";
import { GiftInbox } from "./DashboardPgae";
import {
  erc20Abi,
  stockTokens,
  vaultAbi,
  vaultAddress,
} from "../../web3/contracts";

type Stage = "amount" | "recipient" | "date" | "message";
type TxState = {
  kind: "idle" | "pending" | "success" | "error";
  message: string;
  hash?: Address;
};

const stages: Stage[] = ["amount", "recipient", "date", "message"];

export function TestDashboard() {
  const [stage, setStage] = useState<Stage>("amount");
  const [token, setToken] = useState("NVDA");
  const [kind, setKind] = useState("timelocked");
  const [amount, setAmount] = useState("0.25");
  const [recipient, setRecipient] = useState("");
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [memo, setMemo] = useState("");
  const [tx, setTx] = useState<TxState>({ kind: "idle", message: "" });
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const stock =
    stockTokens.find((item) => item.symbol === token) ?? stockTokens[0];
  const quickAmounts = ["0.10", "0.25", "0.50", "1.00"];
  const stageIndex = stages.indexOf(stage);

  function connectWallet() {
    const connector =
      connectors.find((item) => item.id === "injected") ??
      connectors.find((item) => item.id === "coinbaseWalletSDK") ??
      connectors[0];
    if (connector) connect({ connector, chainId: baseSepolia.id });
  }

  async function createDrop() {
    if (!isConnected) return connectWallet();
    if (!isAddress(recipient))
      return setTx({
        kind: "error",
        message: "Enter a valid recipient wallet address.",
      });
    if (!amount || Number(amount) <= 0)
      return setTx({
        kind: "error",
        message: "Enter an amount greater than zero.",
      });
    if (kind === "timelocked" && !date)
      return setTx({
        kind: "error",
        message: "Choose when this StockDrop becomes claimable.",
      });
    try {
      if (chainId !== baseSepolia.id)
        await switchChainAsync({ chainId: baseSepolia.id });
      if (!publicClient) throw new Error("Base Sepolia client unavailable");
      const decimals = await publicClient.readContract({
        address: stock.address,
        abi: erc20Abi,
        functionName: "decimals",
      });
      const value = parseUnits(amount, decimals);
      const unlockTime =
        kind === "instant"
          ? 0
          : Math.floor(
              new Date(`${date!.toString()}T00:00:00`).getTime() / 1000,
            );
      setTx({
        kind: "pending",
        message: `Approve ${amount} ${token} in your wallet.`,
      });
      const approvalHash = await writeContractAsync({
        address: stock.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [vaultAddress, value],
        chainId: baseSepolia.id,
      });
      await publicClient.waitForTransactionReceipt({ hash: approvalHash });
      setTx({
        kind: "pending",
        message: "Approval confirmed. Create the StockDrop in your wallet.",
      });
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "createDrop",
        args: [recipient, stock.address, value, BigInt(unlockTime), memo],
        chainId: baseSepolia.id,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setTx({
        kind: "success",
        message:
          "StockDrop created. The recipient can claim it after the unlock date.",
        hash,
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message.toLowerCase() : "";
      setTx({
        kind: "error",
        message: reason.includes("user rejected")
          ? "Transaction cancelled. Nothing was transferred."
          : "Unable to create this StockDrop. Check your test-stock balance and Base Sepolia ETH, then try again.",
      });
    }
  }

  function advance() {
    if (stage === "message") {
      void createDrop();
      return;
    }
    setStage(stages[stageIndex + 1]);
  }

  return (
    <div className="min-h-screen bg-background-full font-sans text-text-primary antialiased">
      <header className="grid min-h-20 grid-cols-[1fr_auto] items-center gap-5 px-7 sm:px-10 lg:px-20 xl:px-[200px]">
        <Link to="/" aria-label="StockDrop home">
          <Brand />
        </Link>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting
            ? "Connecting…"
            : address
              ? `${address.slice(0, 6)}…${address.slice(-4)}`
              : "Connect wallet"}
        </Button>
      </header>
      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1440px] place-items-center px-7 py-16 sm:px-10 lg:px-20 xl:px-[200px]">
        <section className="grid w-full max-w-sm gap-8">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-body-medium text-text-secondary"
          >
            <Icon icon={ArrowLeft01Icon} />
            Back to home
          </Link>
          <div>
            <span className="text-caption-1-semibold uppercase tracking-[.1em] text-accent-600">
              Create a StockDrop
            </span>
            <h1 className="mt-3 text-[32px] font-medium leading-[1.08] tracking-[-0.035em] sm:text-[48px]">
              {stage === "amount"
                ? "Choose the stock."
                : stage === "recipient"
                  ? "Add a recipient."
                  : stage === "date"
                    ? "Set the unlock date."
                    : "Leave a message."}
            </h1>
            <p className="mt-4 text-xl font-medium leading-8 text-marketing-secondary">
              {stage === "amount"
                ? "Start with the token and amount you want to share."
                : stage === "recipient"
                  ? "This wallet will be able to claim the stock."
                  : stage === "date"
                    ? "Choose when the recipient can claim their stock."
                    : "This note will stay with the StockDrop."}
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
            {stage === "amount" && (
              <>
                <div className="flex min-w-0 items-end gap-8">
                  <div className="grid min-w-0 w-28 shrink-0 gap-2">
                    <label id="test-token-label" className="text-body-medium">
                      Token
                    </label>
                    <Select
                      aria-labelledby="test-token-label"
                      selectedKey={token}
                      onSelectionChange={(key) => setToken(String(key))}
                      className="min-w-0 w-full"
                      triggerClassName="min-h-10 w-full rounded-full px-3"
                      popoverClassName="w-36 rounded-3xl"
                    >
                      <SelectItem id="NVDA">NVDA</SelectItem>
                      <SelectItem id="TSLA">TSLA</SelectItem>
                      <SelectItem id="AAPL">AAPL</SelectItem>
                    </Select>
                  </div>
                  <div className="grid min-w-0 w-36 shrink-0 gap-2">
                    <label id="test-type-label" className="text-body-medium">
                      Gift type
                    </label>
                    <Select
                      aria-labelledby="test-type-label"
                      selectedKey={kind}
                      onSelectionChange={(key) => setKind(String(key))}
                      className="min-w-0 w-full"
                      triggerClassName="min-h-10 w-full rounded-full px-3"
                      popoverClassName="w-40 rounded-3xl"
                    >
                      <SelectItem id="timelocked">Time-locked</SelectItem>
                      <SelectItem id="instant">Instant</SelectItem>
                    </Select>
                  </div>
                </div>
                <TextField
                  value={amount}
                  onChange={setAmount}
                  className="gap-2"
                >
                  <Label>Stock amount</Label>
                  <InputBase
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    fieldClassName="min-h-[76px] rounded-full bg-transparent px-3 ring-0 hover:ring-0 focus-within:ring-0"
                    className="text-[44px] font-medium leading-none tracking-[-0.035em] tabular-nums sm:text-display-1-medium"
                    leadingAddon={
                      <span className="px-4 text-body-medium text-text-secondary">
                        {token}
                      </span>
                    }
                  />
                </TextField>
                <fieldset className="grid gap-3">
                  <legend className="text-body-medium">Quick amount</legend>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant={amount === value ? "ghost" : "secondary"}
                        className="h-8 w-fit rounded-full px-3 text-body-2-medium tabular-nums"
                        onClick={() => setAmount(value)}
                        aria-pressed={amount === value}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {stage === "recipient" && (
              <TextField
                value={recipient}
                onChange={setRecipient}
                className="gap-2"
              >
                <Label>Recipient wallet address</Label>
                <InputBase
                  placeholder="0x…"
                  autoComplete="off"
                  fieldClassName="min-h-[76px] rounded-full bg-background-secondary-default px-4 ring-0 hover:ring-0 focus-within:ring-0"
                  className="text-[44px] font-medium leading-none tracking-[-0.035em] placeholder:text-text-placeholder sm:text-display-1-medium"
                />
              </TextField>
            )}
            {stage === "date" && (
              <div className="grid gap-2">
                <span className="text-body-medium">Unlock date</span>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  aria-label="Unlock date"
                  className="h-12 w-fit rounded-full px-5"
                />
              </div>
            )}
            {stage === "message" && (
              <TextField value={memo} onChange={setMemo} className="gap-2">
                <Label>Personal message</Label>
                <InputBase
                  placeholder="A little piece of the future for you."
                  fieldClassName="min-h-[76px] rounded-full bg-background-secondary-default px-4"
                  className="text-title-2-medium tracking-[-0.02em]"
                />
              </TextField>
            )}
            {tx.kind !== "idle" && (
              <p
                className={`text-body-medium ${tx.kind === "error" ? "text-text-error-primary" : "text-accent-600"}`}
                role={tx.kind === "error" ? "alert" : "status"}
              >
                {tx.message}
              </p>
            )}
            <Button
              type="button"
              className="h-11 w-fit rounded-full px-5 text-headline-medium"
              disabled={tx.kind === "pending"}
              onClick={advance}
            >
              {tx.kind === "pending"
                ? "Waiting for confirmation…"
                : stage === "message"
                  ? !isConnected
                    ? "Connect wallet to submit"
                    : "Approve and send gift"
                  : stage === "amount"
                    ? "Continue to recipient"
                    : "Next"}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-body-2-medium text-text-secondary">
            <Icon icon={stage === "date" ? LockIcon : GiftIcon} />
            Step {stageIndex + 1} of {stages.length}
          </div>
          <GiftInbox address={address} />
        </section>
      </main>
    </div>
  );
}
