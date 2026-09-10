import { useMemo, useState } from "react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Building03Icon,
  Calendar03Icon,
  GiftIcon,
  Shield01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { formatUnits, isAddress, parseUnits, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { LayerCard } from "@cloudflare/kumo";
import { Link, useSearchParams } from "react-router-dom";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { Brand, Icon } from "../../components/Brand";
import { Button } from "../../components/base/buttons/button";
import type { Flow } from "../../types";
import {
  erc20Abi,
  stockTokens,
  vaultAbi,
  vaultAddress,
} from "../../web3/contracts";

type TxState = {
  kind: "idle" | "pending" | "success" | "error";
  message: string;
  hash?: Address;
};
const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2";
const input = `w-full rounded-full border border-border-button-default bg-background-primary-default px-4 py-3 text-base text-text-primary placeholder:text-text-placeholder ${focus}`;

export function AppPage() {
  const [params, setParams] = useSearchParams();
  const flow: Flow = params.get("flow") === "rewards" ? "rewards" : "gift";
  const [selectedStock, setSelectedStock] = useState("NVDA");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [memo, setMemo] = useState("");
  const [tx, setTx] = useState<TxState>({ kind: "idle", message: "" });
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const stock =
    stockTokens.find((item) => item.symbol === selectedStock) ?? stockTokens[0];

  const setFlow = (next: Flow) => setParams({ flow: next }, { replace: true });
  const connectWallet = () => {
    const connector =
      connectors.find((item) => item.id === "injected") ??
      connectors.find((item) => item.id === "coinbaseWalletSDK") ??
      connectors[0];
    if (connector) connect({ connector, chainId: baseSepolia.id });
  };

  async function createDrop() {
    if (!isConnected) return connectWallet();
    if (!stock.address)
      return setTx({
        kind: "error",
        message: "This test token is not configured.",
      });
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
    if (!date)
      return setTx({
        kind: "error",
        message: "Choose when this StockDrop becomes claimable.",
      });
    const chosenDate = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosenDate < today)
      return setTx({
        kind: "error",
        message: "Choose today or a future unlock date.",
      });
    const unlockTime =
      chosenDate.getTime() === today.getTime()
        ? 0
        : Math.floor(chosenDate.getTime() / 1000);
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
      const balance = await publicClient.readContract({
        address: stock.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address!],
      });
      if (balance < value) {
        return setTx({
          kind: "error",
          message: `Insufficient ${stock.symbol} balance. You need ${amount} ${stock.symbol} in the connected wallet.`,
        });
      }
      setTx({
        kind: "pending",
        message: `Approve ${amount} ${stock.symbol} in your wallet.`,
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
      setRecipient("");
      setAmount("");
      setMemo("");
    } catch (error) {
      const reason = getTransactionError(error);
      setTx({
        kind: "error",
        message: reason.includes("user rejected")
          ? "Transaction cancelled. Nothing was transferred."
          : reason.includes("estimate gas") ||
              reason.includes("useroperation reverted")
            ? "The connected wallet could not execute this transfer. Use the funded test wallet and check its test-stock balance."
            : `Unable to create this StockDrop: ${reason || "check your stock and Base Sepolia ETH balances, then try again."}`,
      });
    }
  }

  return (
    <div className="min-h-screen bg-background-full font-sans text-text-primary antialiased">
      <a
        className={`fixed start-2 top-2 z-50 -translate-y-20 rounded-lg bg-white px-4 py-2 focus:translate-y-0 ${focus}`}
        href="#main-content"
      >
        Skip to content
      </a>
      <header className="grid min-h-20 grid-cols-[1fr_auto] items-center gap-5 px-7 sm:px-10 lg:px-20 xl:grid-cols-[1fr_auto_1fr] xl:px-[200px]">
        <Link to="/" aria-label="Go to StockDrop home" className={focus}>
          <Brand />
        </Link>
        <nav
          className="order-3 col-span-2 flex justify-center gap-7 lg:order-none lg:col-span-1"
          aria-label="Application navigation"
        >
          <Tab active={flow === "gift"} onClick={() => setFlow("gift")}>
            Gift stocks
          </Tab>
          <Tab active={flow === "rewards"} onClick={() => setFlow("rewards")}>
            Reward customers
          </Tab>
        </nav>
        <button
          className={`justify-self-end inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ced1c7] bg-white px-4 text-sm font-bold disabled:opacity-60 ${focus}`}
          type="button"
          disabled={isConnecting}
          onClick={() => (isConnected ? disconnect() : connectWallet())}
        >
          <Icon icon={Wallet01Icon} />
          <span className="hidden sm:inline">
            {isConnecting
              ? "Connecting…"
              : address
                ? `${address.slice(0, 6)}…${address.slice(-4)}`
                : "Connect wallet"}
          </span>
        </button>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-[1440px] px-7 py-12 sm:px-10 lg:px-20 xl:px-[200px]"
      >
        <Link
          className={`inline-flex items-center gap-2 rounded-lg py-2 text-sm text-[#5f635a] ${focus}`}
          to="/"
        >
          <Icon icon={ArrowLeft01Icon} />
          Back to home
        </Link>
        <div className="mt-7 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="text-caption-1-semibold uppercase tracking-[.1em] text-accent-600">
              {flow === "gift" ? "Personal gifting" : "Corporate rewards"}
            </span>
            <h1 className="mt-3 max-w-3xl text-[32px] font-medium leading-[1.08] tracking-[-.035em] text-balance sm:text-[48px]">
              {flow === "gift"
                ? "Send an investment, not just a gift."
                : "Reward loyalty with real ownership."}
            </h1>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-8 text-marketing-secondary">
              {flow === "gift"
                ? "Choose a stock, set a date, and send it directly to any wallet."
                : "Fund stock rewards for purchases, referrals, and loyal customers."}
            </p>
          </div>
          <span className="flex items-center gap-2 whitespace-nowrap rounded-full bg-accent-50 px-3 py-2 text-caption-1-semibold text-accent-700">
            <i className="size-2 rounded-full bg-accent-600" />
            Base Sepolia
          </span>
        </div>

        <div className="mt-10 grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.75fr)]">
          <section
            className="rounded-[1.75rem] bg-[#f9f8f4] p-6 sm:p-8"
            aria-labelledby="create-title"
          >
            <div className="mb-8 flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-600 text-caption-1-semibold text-text-white">
                1
              </span>
              <div>
                <h2 id="create-title" className="text-title-1-medium">
                  {flow === "gift"
                    ? "Create a stock gift"
                    : "Create a reward campaign"}
                </h2>
                <p className="mt-1 text-base font-medium leading-6 text-marketing-secondary">
                  Approve the exact amount, then confirm the vault deposit.
                </p>
              </div>
            </div>
            <fieldset className="mb-7">
              <legend className="mb-3 text-body-medium text-text-primary">
                Choose a test stock
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {stockTokens.map((item) => (
                  <label
                    className={`relative grid cursor-pointer grid-cols-[auto_1fr] items-center gap-2.5 rounded-3xl border p-4 ${selectedStock === item.symbol ? "border-accent-600 bg-accent-50 ring-1 ring-accent-600" : "border-border-button-default bg-background-primary-default"} ${focus}`}
                    key={item.symbol}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="stock"
                      checked={selectedStock === item.symbol}
                      onChange={() => setSelectedStock(item.symbol)}
                    />
                    <StockLogo symbol={item.symbol} />
                    <span>
                      <strong className="block text-body-medium">
                        {item.symbol}
                      </strong>
                      <small className="block text-body-2-medium text-text-secondary">
                        {item.name}
                      </small>
                    </span>
                    <span className="col-span-2 mt-1 flex justify-between border-t border-separator-border pt-2 text-body-2-medium">
                      <span>{item.price}</span>
                      <small className="text-accent-600">{item.change}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
              <Field
                label={
                  flow === "gift"
                    ? "Recipient wallet"
                    : "Reward recipient wallet"
                }
              >
                <input
                  className={input}
                  name="wallet"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  autoComplete="off"
                  placeholder="0x1234…abcd"
                />
              </Field>
              <Field label="Amount">
                <div className="relative">
                  <input
                    className={`${input} pe-16`}
                    name="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    placeholder="0.00"
                  />
                  <b className="pointer-events-none absolute end-3 top-3.5 text-xs">
                    {selectedStock}
                  </b>
                </div>
              </Field>
            </div>
            <Field
              label={flow === "gift" ? "Unlock date" : "Claim date"}
              hint={
                flow === "gift"
                  ? "The recipient can claim after this date."
                  : "Choose today for an immediately claimable reward."
              }
            >
              <div className="relative">
                <span className="pointer-events-none absolute start-3 top-3 text-[#777b72]">
                  <Icon icon={Calendar03Icon} />
                </span>
                <input
                  className={`${input} ps-11`}
                  name="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </Field>
            <Field
              label={flow === "gift" ? "Personal memo" : "Campaign note"}
              hint={`${memo.length}/140 characters. Stored onchain with the gift.`}
            >
              <textarea
                className={`${input} min-h-24 resize-y leading-6`}
                name="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                maxLength={140}
                placeholder={
                  flow === "gift"
                    ? "Happy birthday — here’s a piece of the future."
                    : "1% stock cashback reward"
                }
              />
            </Field>
            {tx.kind !== "idle" && <TxMessage tx={tx} />}
            <button
              className={`mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-button-primary px-5 text-headline-medium text-text-white disabled:cursor-not-allowed disabled:opacity-60 ${focus}`}
              type="button"
              disabled={tx.kind === "pending"}
              onClick={createDrop}
            >
              {tx.kind === "pending"
                ? "Waiting for confirmation…"
                : !isConnected
                  ? "Connect wallet to continue"
                  : flow === "gift"
                    ? "Approve and send gift"
                    : "Approve and create reward"}
              <Icon icon={ArrowRight01Icon} />
            </button>
          </section>
          <aside
            className="rounded-[1.75rem] bg-[#f9f8f4] p-7 lg:sticky lg:top-28"
            aria-label="Transaction summary"
          >
            <div className="grid size-16 place-items-center rounded-2xl bg-accent-50 text-accent-600">
              <Icon
                icon={flow === "gift" ? GiftIcon : Building03Icon}
                size={34}
              />
            </div>
            <span className="mt-7 block text-caption-1-semibold uppercase tracking-[.1em] text-accent-600">
              StockDrop Vault
            </span>
            <h2 className="mt-3 text-title-1-medium">
              {flow === "gift"
                ? "A gift that can grow."
                : "Rewards customers can own."}
            </h2>
            <p className="mt-3 text-base font-medium leading-6 text-marketing-secondary">
              The vault holds only the approved amount until the recipient
              claims it.
            </p>
            <dl className="my-7 border-y border-separator-border py-4 text-body-medium">
              <Summary name="Network" value="Base Sepolia" />
              <Summary name="Selected asset" value={selectedStock} />
              <Summary name="Vault fee" value="0.00%" />
            </dl>
            <div className="flex gap-3 text-accent-600">
              <Icon icon={Shield01Icon} />
              <span>
                <strong className="block text-body-medium text-text-primary">
                  Non-custodial by design
                </strong>
                <small className="mt-1 block text-body-2-medium leading-5 text-text-secondary">
                  Only the named recipient can claim.
                </small>
              </span>
            </div>
          </aside>
        </div>
        <GiftInbox address={address} />
      </main>
    </div>
  );
}

function getTransactionError(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const candidate = error as {
    shortMessage?: string;
    details?: string;
    message?: string;
    cause?: { shortMessage?: string; details?: string; message?: string };
  };
  return (
    candidate.shortMessage ??
    candidate.details ??
    candidate.cause?.shortMessage ??
    candidate.cause?.details ??
    candidate.message ??
    ""
  ).toLowerCase();
}

function StockLogo({ symbol }: { symbol: string }) {
  if (symbol === "AAPL")
    return (
      <span className="grid size-10 place-items-center rounded-2xl bg-black text-white">
        <svg className="size-5" viewBox="0 0 814 1000" aria-hidden="true">
          <path
            fill="currentColor"
            d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
          />
        </svg>
      </span>
    );
  if (symbol === "TSLA")
    return (
      <span className="grid size-10 place-items-center rounded-2xl bg-[#cc0000] text-white">
        <svg className="size-6" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 5.362l2.475-3.026s4.245.09 8.471 2.054c-1.082 1.636-3.231 2.438-3.231 2.438-.146-1.439-1.154-1.79-4.354-1.79L12 24 8.619 5.034c-3.18 0-4.188.354-4.335 1.792 0 0-2.146-.795-3.229-2.43C5.28 2.431 9.525 2.34 9.525 2.34L12 5.362l-.004.002H12v-.002z"
          />
        </svg>
      </span>
    );
  return (
    <span className="grid size-10 place-items-center rounded-2xl bg-accent-600 text-caption-1-semibold text-white">
      N
    </span>
  );
}
function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      className={`relative min-h-11 py-2 text-sm font-bold ${active ? "text-accent-600 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent-600" : "text-text-secondary"} ${focus}`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-sm font-bold text-[#454941]">
        {label}
      </span>
      {children}
      {hint && (
        <small className="mt-2 block text-xs leading-5 text-[#757a70]">
          {hint}
        </small>
      )}
    </label>
  );
}
function Summary({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-[#74786f]">{name}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}
function TxMessage({ tx }: { tx: TxState }) {
  const style =
    tx.kind === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : tx.kind === "success"
        ? "border-purple-200 bg-purple-50 text-purple-900"
        : "border-blue-200 bg-blue-50 text-blue-900";
  return (
    <div
      className={`mb-5 rounded-xl border p-4 text-sm ${style}`}
      role={tx.kind === "error" ? "alert" : "status"}
    >
      <strong className="block">
        {tx.kind === "pending"
          ? "Transaction in progress"
          : tx.kind === "success"
            ? "StockDrop sent"
            : "Action needed"}
      </strong>
      <span className="mt-1 block text-xs leading-5">{tx.message}</span>
      {tx.hash && (
        <a
          className="mt-2 inline-block font-bold underline underline-offset-4"
          href={`https://sepolia.basescan.org/tx/${tx.hash}`}
          target="_blank"
          rel="noreferrer"
        >
          View transaction
        </a>
      )}
    </div>
  );
}

export function GiftInbox({ address }: { address?: Address }) {
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const [message, setMessage] = useState("");
  const [currentTime] = useState(() => Date.now());
  const ids = useReadContract({
    address: vaultAddress,
    abi: vaultAbi,
    functionName: "recipientDropIds",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
  const contracts = useMemo(
    () =>
      (ids.data ?? []).map((id) => ({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "getDrop" as const,
        args: [id] as const,
      })),
    [ids.data],
  );
  const drops = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0 },
  });
  async function claim(id: bigint) {
    if (!publicClient) return;
    try {
      setMessage("Confirm the claim in your wallet.");
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "claim",
        args: [id],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setMessage("Claim complete. The stock is now in your wallet.");
      await drops.refetch();
    } catch {
      setMessage("Unable to claim. Check the unlock date and try again.");
    }
  }
  return (
    <section className="mt-16" aria-labelledby="inbox-title">
      <span className="text-caption-1-semibold uppercase tracking-[.1em] text-accent-600">
        Recipient inbox
      </span>
      <h2 id="inbox-title" className="mt-3 text-title-1-medium">
        StockDrops waiting for you
      </h2>
      {message && (
        <p className="mt-3 text-body-medium text-accent-600" role="status">
          {message}
        </p>
      )}
      <div className="mt-6 grid gap-4">
        {!address ? (
          <LayerCard>
            <LayerCard.Secondary className="text-body-medium text-text-primary">
              Connect wallet to claim
            </LayerCard.Secondary>
            <LayerCard.Primary className="text-body-medium text-text-secondary">
              Your StockDrops will appear here when you connect the recipient
              wallet.
            </LayerCard.Primary>
          </LayerCard>
        ) : drops.data?.length ? (
          drops.data.map((result, index) => {
            if (result.status !== "success") return null;
            const drop = result.result;
            const unlocked = Number(drop.unlockTime) * 1000 <= currentTime;
            return (
              <LayerCard key={String(ids.data?.[index])}>
                <LayerCard.Secondary className="flex items-center justify-between text-body-medium text-text-primary">
                  <div>
                    {drop.claimed
                      ? "Claimed"
                      : unlocked
                        ? "Ready to claim"
                        : `Unlocks ${new Date(Number(drop.unlockTime) * 1000).toLocaleDateString()}`}
                  </div>
                  <Button
                    variant={
                      unlocked && !drop.claimed ? "primary" : "secondary"
                    }
                    size="medium"
                    disabled={drop.claimed || !unlocked || isPending}
                    onClick={() => claim(ids.data![index])}
                  >
                    Claim stock
                  </Button>
                </LayerCard.Secondary>
                <LayerCard.Primary className="text-text-primary">
                  <strong className="block text-title-2-medium">
                    {formatUnits(drop.amount, 18)} shares
                  </strong>
                  <span className="mt-1 block text-body-medium text-text-secondary">
                    {drop.memo || "A StockDrop for you"}
                  </span>
                </LayerCard.Primary>
              </LayerCard>
            );
          })
        ) : (
          <LayerCard>
            <LayerCard.Secondary className="text-body-medium text-text-primary">
              No StockDrops yet
            </LayerCard.Secondary>
            <LayerCard.Primary className="text-body-medium text-text-secondary">
              Gifts sent to this wallet will appear here.
            </LayerCard.Primary>
          </LayerCard>
        )}
      </div>
    </section>
  );
}
