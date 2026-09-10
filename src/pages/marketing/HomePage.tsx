import {
  ArrowRight01Icon,
  Building03Icon,
  GiftIcon,
  LockIcon,
  ShoppingBag01Icon,
  SparklesIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand, Icon } from "../../components/Brand";
import { Button, ButtonLink } from "../../components/base/buttons/button";
import { InputBase, TextField } from "../../components/base/input/input";
import { Label } from "../../components/base/input/label";
import { Select, SelectItem } from "../../components/base/select/select";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2";

export function HomePage() {
  return (
    <div className="min-h-screen bg-background-full font-sans text-text-primary antialiased">
      <a
        className={`fixed start-2 top-2 z-50 -translate-y-20 rounded-lg bg-white px-4 py-2 focus:translate-y-0 ${focus}`}
        href="#main-content"
      >
        Skip to content
      </a>
      <header className="grid min-h-20 w-full grid-cols-[1fr_auto] items-center gap-7 px-7 sm:px-10 lg:px-[200px] xl:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label="StockDrop home" className={focus}>
          <Brand />
        </Link>
        <nav
          className="hidden items-center gap-10 text-headline-medium text-text-primary lg:flex"
          aria-label="Main navigation"
        >
          <a className={focus} href="#how-it-works">
            How it works
          </a>
          <a className={focus} href="#use-cases">
            Use cases
          </a>
          <a className={focus} href="#faq">
            FAQ
          </a>
        </nav>
        <ButtonLink href="/app" variant="secondary" className="h-11 justify-self-end rounded-full px-4 text-headline-medium">Launch app</ButtonLink>
      </header>

      <main id="main-content">
        <section className="mx-auto grid min-h-[720px] max-w-[1440px] items-center gap-14 px-7 py-20 sm:px-10 lg:px-[200px] lg:py-24 xl:grid-cols-[minmax(0,1fr)_minmax(384px,.88fr)] xl:gap-20">
          <div>
            <h1 className="max-w-2xl text-[32px] font-medium leading-[1.04] tracking-[-0.035em] text-balance sm:text-display-1-medium">
              Give someone a piece of the future.
            </h1>
            <p className="mt-6 max-w-xl text-headline-medium leading-7 text-marketing-secondary text-pretty">
              Send tokenized stocks as time-locked gifts or turn every purchase
              into ownership. One protocol, built for people and businesses.
            </p>
          </div>
          <GiftComposer />
        </section>

        <section
          id="use-cases"
          className="bg-white px-5 py-24 md:px-7 md:py-28"
        >
          <div className="mx-auto mb-14 max-w-3xl">
            <h2 className="text-[32px] font-medium leading-[1.08] tracking-[-0.035em] text-balance sm:text-[48px]">
              Everything you need to share ownership.
            </h2>
            <p className="mt-5 max-w-2xl text-xl font-medium leading-8 text-marketing-secondary text-pretty">
              Build thoughtful gifts, rewards, and retention programs with one programmable stock vault.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={GiftIcon} color="text-purple-600" title="Personal gifting">Send a stock to any wallet with a personal message.</FeatureCard>
            <FeatureCard icon={LockIcon} color="text-blue-600" title="Timed ownership">Choose exactly when a gift becomes claimable.</FeatureCard>
            <FeatureCard icon={ShoppingBag01Icon} color="text-orange-600" title="Stock cashback">Turn every qualifying checkout into ownership.</FeatureCard>
            <FeatureCard icon={SparklesIcon} color="text-amber-600" title="Referral rewards">Reward customers for sharing your business.</FeatureCard>
            <FeatureCard icon={Building03Icon} color="text-rose-600" title="Reward pools">Fund a flexible stock program for your community.</FeatureCard>
            <FeatureCard icon={Wallet01Icon} color="text-emerald-600" title="Direct claiming">Let recipients claim straight into their wallet.</FeatureCard>
          </div>
        </section>
        <section id="how-it-works" className="px-5 py-24 md:px-7 md:py-28">
          <div className="mx-auto mb-14 max-w-3xl">
            <h2 className="text-[32px] font-medium leading-[1.08] tracking-[-0.035em] text-balance sm:text-[48px]">
              From wallet to ownership in three steps.
            </h2>
            <p className="mt-5 max-w-2xl text-xl font-medium leading-8 text-marketing-secondary text-pretty">
              Choose the stock, set the rules, and send an ownership experience that lasts.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            <Step icon={Wallet01Icon} color="text-blue-600" title="Connect your wallet">
              Use Coinbase Wallet or connect an existing wallet on Base.
            </Step>
            <Step icon={GiftIcon} color="text-purple-600" title="Choose the stock">
              Select a test stock, amount, recipient, and unlock date.
            </Step>
            <Step icon={LockIcon} color="text-orange-600" title="Lock and send">
              The vault secures it until the recipient can claim.
            </Step>
          </div>
        </section>
        <section id="faq" className="bg-background-full px-5 py-24 md:px-7 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div>
              <h2 className="text-[32px] font-medium leading-[1.08] tracking-[-0.035em] text-balance sm:text-[48px]">Questions, answered.</h2>
              <p className="mt-5 max-w-md text-xl font-medium leading-8 text-marketing-secondary">Everything you need to know before sending your first StockDrop.</p>
            </div>
            <div className="grid gap-3">
              <FaqItem question="What are tokenized stocks?">They are onchain tokens designed to represent stock exposure and can be distributed through StockDrop vaults.</FaqItem>
              <FaqItem question="Can I choose when a gift unlocks?">Yes. Set an instant claim or a future unlock time when creating the gift.</FaqItem>
              <FaqItem question="Where does the stock go?">The vault sends the selected token directly to the recipient’s wallet after it unlocks.</FaqItem>
              <FaqItem question="Can businesses run reward programs?">Yes. Businesses can fund a reward pool for cashback, loyalty, and referral campaigns.</FaqItem>
            </div>
          </div>
        </section>
        <section className="bg-black px-5 py-24 text-white md:px-7 md:py-28">
          <div className="mx-auto grid max-w-6xl rounded-[2rem] bg-[#1a1a1a] px-7 py-16 text-center sm:px-12 md:py-20">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 text-purple-300"><Icon icon={SparklesIcon} size={34} /></div>
            <h2 className="mx-auto mt-7 max-w-3xl text-[32px] font-medium leading-[1.08] tracking-[-0.035em] text-balance sm:text-[48px]">Make the next gift mean more.</h2>
            <p className="mx-auto mt-5 max-w-xl text-xl font-medium leading-8 text-neutral-400">Send programmable ownership on Base in minutes.</p>
            <Link to="/app?flow=gift" className={`mx-auto mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-headline-medium text-black transition-transform active:scale-96 ${focus}`}>Create your first StockDrop <Icon icon={ArrowRight01Icon} /></Link>
          </div>
        </section>
      </main>
      <footer className="bg-black px-7 py-14 text-neutral-400 lg:px-20 xl:px-[200px]">
        <div className="grid gap-12 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <span className="text-headline-medium text-white">stockdrop</span>
            <p className="mt-4 max-w-xs text-body-medium">Programmable stock distribution on Base.</p>
          </div>
          <FooterLinks title="Legal" links={[['Licenses', 'https://www.moonpay.com/legal/licenses'], ['Privacy policy', 'https://www.moonpay.com/legal/privacy_policy'], ['Cookie policy', 'https://www.moonpay.com/legal/cookie_policy'], ['Terms of use', 'https://www.moonpay.com/legal']]}/>
          <FooterLinks title="Company" links={[['About us', 'https://www.moonpay.com/about-us'], ['Careers — we’re hiring', 'https://www.moonpay.com/careers'], ['Newsroom', 'https://www.moonpay.com/newsroom'], ['Media', 'https://www.moonpay.com/newsroom/media'], ['Changelog', 'https://www.moonpay.com/newsroom/changelog']]}/>
          <FooterLinks title="Support" links={[['API docs', 'https://dev.moonpay.com/'], ['Help center', 'https://support.moonpay.com/'], ['Contact us', 'https://www.moonpay.com/contact-us'], ['Status', 'https://status.moonpay.com/'], ['Security', 'https://www.moonpay.com/security'], ['Ramps', 'https://www.moonpay.com/business/ramps']]}/>
        </div>
        <div className="mt-14 border-t border-white/10 pt-6 text-body-medium">© 2026 StockDrop</div>
      </footer>
    </div>
  );
}

function GiftComposer() {
  const navigate = useNavigate();
  const [token, setToken] = useState("NVDA");
  const [giftType, setGiftType] = useState("timelocked");
  const [amount, setAmount] = useState("0.25");
  const quickAmounts = ["0.10", "0.25", "0.50", "1.00"];

  function openGiftFlow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(`/app?flow=gift&token=${token}&type=${giftType}&amount=${amount}`);
  }

  return (
    <form
      onSubmit={openGiftFlow}
      className="w-full min-w-0 max-w-xs justify-self-start p-1 sm:p-2"
    >
      <div className="flex items-start gap-6">
        <div className="grid gap-1">
          <span className="text-caption-1-semibold uppercase tracking-[0.08em] text-text-secondary">
            Create a gift
          </span>
          <h2 className="text-title-1-medium">Choose the stock</h2>
        </div>
      </div>

      <div className="mt-8 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
        <div className="flex min-w-0 items-end gap-8">
        <div className="grid min-w-0 w-28 shrink-0 gap-2">
          <label
            id="token-label"
            className="text-body-medium text-text-primary"
          >
            Token
          </label>
          <Select
            aria-labelledby="token-label"
            selectedKey={token}
            onSelectionChange={(key) => setToken(String(key))}
            className="min-w-0 w-full"
            triggerClassName="min-h-10 w-full rounded-full px-3"
            popoverClassName="w-36 rounded-3xl"
          >
            <SelectItem id="NVDA">NVDA · Nvidia</SelectItem>
            <SelectItem id="TSLA">TSLA · Tesla</SelectItem>
            <SelectItem id="AAPL">AAPL · Apple</SelectItem>
          </Select>
        </div>

        <div className="grid min-w-0 w-36 shrink-0 gap-2">
          <label
            id="gift-type-label"
            className="text-body-medium text-text-primary"
          >
            Gift type
          </label>
          <Select
            aria-labelledby="gift-type-label"
            selectedKey={giftType}
            onSelectionChange={(key) => setGiftType(String(key))}
            className="min-w-0 w-full"
            triggerClassName="min-h-10 w-full rounded-full px-3"
            popoverClassName="w-40 rounded-3xl"
          >
            <SelectItem id="timelocked">Time-locked gift</SelectItem>
            <SelectItem id="instant">Instant gift</SelectItem>
          </Select>
        </div>
        </div>

        <TextField value={amount} onChange={setAmount} className="gap-2">
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
          <legend className="text-body-medium text-text-primary">
            Quick amount
          </legend>
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

        <Button type="submit" className="mt-2 h-11 w-fit rounded-full px-5 text-headline-medium">
          Continue to recipient
        </Button>
      </div>
    </form>
  );
}

function FeatureCard({ icon, color, title, children }: { icon: IconSvgElement; color: string; title: string; children: string }) {
  return <article className="rounded-[1.75rem] bg-[#f9f8f4] p-7 sm:p-8">
    <div className={`mb-12 grid size-14 place-items-center rounded-2xl bg-white ${color}`}><Icon icon={icon} size={32} /></div>
    <h3 className="text-2xl font-medium leading-tight tracking-[-0.025em]">{title}</h3>
    <p className="mt-3 text-base font-medium leading-6 text-marketing-secondary">{children}</p>
  </article>
}
function FaqItem({ question, children }: { question: string; children: string }) {
  return <details className="group rounded-3xl bg-[#f9f8f4] px-6 py-5">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-title-2-medium text-text-primary">{question}<span className="text-2xl font-medium text-text-secondary transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary>
    <p className="mt-4 max-w-2xl text-base font-medium leading-6 text-marketing-secondary">{children}</p>
  </details>
}
function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return <div>
    <h3 className="text-headline-medium text-white">{title}</h3>
    <ul className="mt-4 grid gap-3 text-body-medium">
      {links.map(([label, href]) => <li key={label}><a className="transition-colors hover:text-white" href={href} target="_blank" rel="noreferrer">{label}</a></li>)}
    </ul>
  </div>
}
function Step({ icon, color, title, children }: { icon: IconSvgElement; color: string; title: string; children: string }) {
  return (
    <article className="rounded-[1.75rem] bg-[#f9f8f4] p-7 sm:p-8">
      <div className={`mb-12 grid size-14 place-items-center rounded-2xl bg-white ${color}`}>
        <Icon icon={icon} size={32} />
      </div>
      <h3 className="text-2xl font-medium leading-tight tracking-[-0.025em]">{title}</h3>
      <p className="mt-3 text-base font-medium leading-6 text-marketing-secondary">{children}</p>
    </article>
  );
}
