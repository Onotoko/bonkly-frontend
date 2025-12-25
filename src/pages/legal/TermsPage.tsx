import { useNavigate } from 'react-router-dom';
import iconClose from '@/assets/icons/icon-close.svg';

export function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="terms-shell">
            {/* Header */}
            <header className="terms-header">
                <h1 className="terms-title">Term of Conditions</h1>
                <button className="icon-button" onClick={() => navigate(-1)}>
                    <img src={iconClose} alt="Close" />
                </button>
            </header>

            {/* Content */}
            <div className="terms-content">
                {/* Intro */}
                <div className="terms-intro">
                    <p><strong>Bonkly — Terms of Service (Master Agreement)</strong></p>
                    <p><strong>Jurisdiction: Cayman Islands</strong></p>
                    <p><strong>Last Updated: 25/11/2025</strong></p>
                </div>

                {/* Section 1 */}
                <section className="terms-section">
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to Bonkly, a social platform for creating, sharing,
                        remixing, and rewarding memes using BONK, AI tools, and
                        user engagement.
                    </p>
                    <p>
                        These Terms of Service ("Terms," "Agreement") govern your
                        access to and use of:
                    </p>
                    <ul>
                        <li>The Bonkly mobile app</li>
                        <li>The Bonkly website</li>
                        <li>Bonkly smart contracts</li>
                        <li>Meme creation tools</li>
                        <li>AI generation features</li>
                        <li>Wallet integrations</li>
                        <li>BONK/dBONK/Laugh Power systems</li>
                        <li>Contest and reward programs</li>
                        <li>All other associated services ("Service")</li>
                    </ul>
                    <p>
                        By accessing or using Bonkly, you agree to these Terms.
                        If you do not agree, please do not use Bonkly.
                    </p>
                </section>

                {/* Section 2 */}
                <section className="terms-section">
                    <h2>2. Eligibility</h2>
                    <p>To use Bonkly, you must:</p>
                    <ul>
                        <li>Be at least 18 years old</li>
                        <li>Have full legal capacity</li>
                        <li>Reside in a region where crypto-based services are allowed</li>
                        <li>Not be subject to sanctions or restricted access</li>
                        <li>Not be prohibited from using Web3, Solana, or AI-powered tools</li>
                    </ul>
                    <p>Bonkly does not knowingly allow minors under 18.</p>
                </section>

                {/* Section 3 */}
                <section className="terms-section">
                    <h2>3. Account Registration</h2>
                    <p>You may be required to:</p>
                    <ul>
                        <li>Create a username</li>
                        <li>Set a public display name</li>
                        <li>Upload a profile photo</li>
                        <li>Link or provide a valid Solana wallet address</li>
                        <li>Deposit BONK to activate posting, Laugh Power, or AI credits</li>
                    </ul>
                    <p>You agree that:</p>
                    <ul>
                        <li>You are responsible for all account activity</li>
                        <li>You will not share or compromise your wallet keys</li>
                        <li>Bonkly is not responsible for lost, hacked, or compromised wallets</li>
                    </ul>
                </section>

                {/* Section 4 */}
                <section className="terms-section">
                    <h2>4. Platform Overview</h2>
                    <p>Bonkly provides:</p>
                    <ul>
                        <li>A meme feed featuring images and video content</li>
                        <li>Reaction tools ("Love" and "Laugh")</li>
                        <li>BONK-based rewards</li>
                        <li>Laugh Power (dBONK) staking</li>
                        <li>Meme contests and challenges</li>
                        <li>AI-powered meme generation</li>
                        <li>Internal BONK balances for rewards</li>
                        <li>Withdrawal tools to external Solana wallets</li>
                    </ul>
                    <p>Bonkly does not provide:</p>
                    <ul>
                        <li>Financial advice</li>
                        <li>Investment guarantees</li>
                        <li>Custodial wallet services</li>
                        <li>Tax advice</li>
                        <li>BONK issuance</li>
                    </ul>
                </section>

                {/* Section 5 */}
                <section className="terms-section">
                    <h2>5. BONK Deposits, Laugh Power (dBONK), and Rewards</h2>

                    <h3>5.1 BONK Deposits</h3>
                    <p>By depositing BONK into Bonkly, you agree:</p>
                    <ul>
                        <li>Deposits are final</li>
                        <li>BONK may be converted to dBONK (locked state)</li>
                        <li>BONK is used for fees, AI credits, reactions, and rewards</li>
                        <li>Gas fees may apply</li>
                    </ul>

                    <h3>5.2 Laugh Power / dBONK</h3>
                    <p>
                        Laugh Power ("dBONK") is a <strong>non-withdrawable, non-transferable</strong> influence
                        metric created when users Power Up BONK.
                    </p>
                    <ul>
                        <li>1 BONK converts to 15 dBONK (unless updated later)</li>
                        <li>Laughing burns a small amount of dBONK</li>
                        <li>Laugh Power affects reaction weight and ranking influence</li>
                    </ul>

                    <h3>5.3 Power Down Rules</h3>
                    <p>When you Power Down:</p>
                    <ul>
                        <li>The selected amount unlocks linearly over 8 weeks</li>
                        <li>Each week, 1/8 of the amount becomes withdrawable BONK</li>
                        <li>You may cancel a power down any time</li>
                        <li>Partial unlocks are irreversible</li>
                    </ul>

                    <h3>5.4 Rewards</h3>
                    <div className="terms-highlight">
                        <p>Creators earn BONK when users Laugh at their content. Reward amounts depend on:</p>
                        <ul>
                            <li>Laugh weight of reacting users</li>
                            <li>Time of reaction</li>
                            <li>Ranking multiplier</li>
                            <li>Platform-defined reward distribution</li>
                        </ul>
                    </div>
                    <p>
                        Rewards are added to your <strong>internal BONK wallet</strong>, which
                        you may withdraw subject to network fees and security checks.
                    </p>
                </section>

                {/* Section 6 */}
                <section className="terms-section">
                    <h2>6. AI Tools and Generated Content</h2>
                    <p>
                        Bonkly offers AI tools powered by third-party providers such
                        as OpenAI, Gemini, and others. By using AI features, you
                        acknowledge:
                    </p>
                    <ul>
                        <li>AI outputs may be inaccurate or unexpected</li>
                        <li>You must review content before posting</li>
                        <li>AI credits are purchased using BONK</li>
                        <li>AI content may be subject to copyright laws</li>
                        <li>You are responsible for the content you generate and post</li>
                        <li>Bonkly is not liable for harmful or infringing AI outputs</li>
                    </ul>
                </section>

                {/* Section 7 */}
                <section className="terms-section">
                    <h2>7. User Content (UGC) and Ownership</h2>
                    <p>
                        You retain rights to the memes, images, and videos you post.
                        However, by uploading or generating content on Bonkly, you
                        grant us a <strong>non-exclusive, worldwide, royalty-free license</strong> to:
                    </p>
                    <ul>
                        <li>Display, host, distribute, and modify the content</li>
                        <li>Use your content for marketing, promotion, or platform features</li>
                        <li>Allow others to view and interact with your content</li>
                    </ul>
                    <p>You agree NOT to upload:</p>
                    <ul>
                        <li>Copyrighted materials you do not own or have rights to</li>
                        <li>Pornography, minors, explicit sexual content</li>
                        <li>Violence, hate speech, or harassment</li>
                        <li>Sensitive private data</li>
                        <li>Deepfakes intended to harm</li>
                        <li>Dangerous or illegal content</li>
                        <li>Spam, scams, or advertisements</li>
                        <li>Malware or code intended to harm devices</li>
                    </ul>
                    <p>Bonkly may remove content or suspend accounts at any time.</p>
                </section>

                {/* Section 8 */}
                <section className="terms-section">
                    <h2>8. Copyright Policy (DMCA / Cayman Equivalents)</h2>
                    <p><em>(Integrated NFT/UGC Copyright Policy)</em></p>
                    <p>Bonkly follows DMCA-style notice and takedown procedures.</p>
                    <p>If you upload copyrighted content without permission, you may be:</p>
                    <ul>
                        <li>Subject to takedowns</li>
                        <li>Suspended or banned</li>
                        <li>Required to compensate rights holders</li>
                    </ul>
                    <p>
                        If you believe your copyrighted work is posted on Bonkly
                        without permission:
                    </p>
                    <p>Email: hi@bonkly.meme</p>
                    <p>Include:</p>
                    <ul>
                        <li>Identification of the work</li>
                        <li>Proof of ownership</li>
                        <li>URL(s) to infringing content</li>
                        <li>Your name and email</li>
                        <li>Statement of good faith</li>
                    </ul>
                    <p>Repeat offenders will be banned.</p>
                </section>

                {/* Section 9 */}
                <section className="terms-section">
                    <h2>9. Contest & Challenge Terms</h2>
                    <p><em>(Integrated section)</em></p>
                    <p>By participating in contests:</p>
                    <ul>
                        <li>You must submit original or permitted content</li>
                        <li>Rankings are determined by Loves, Laughs, and/or platform logic</li>
                        <li>Rewards are BONK-based and may fluctuate</li>
                        <li>Cheating or manipulation results in disqualification</li>
                        <li>Bonkly may modify or cancel contests any time</li>
                        <li>Users are responsible for reporting contest earnings to tax authorities</li>
                    </ul>
                </section>

                {/* Section 10 */}
                <section className="terms-section">
                    <h2>10. Withdrawal & Payment Policy</h2>
                    <ul>
                        <li>Withdrawals require a valid Solana wallet</li>
                        <li>Users pay all gas fees</li>
                        <li>Processing time depends on network congestion</li>
                        <li>Withdrawals may be delayed for fraud checks</li>
                        <li>Incorrect addresses result in irreversible loss of funds</li>
                        <li>Bonkly is not liable for mis-sent tokens</li>
                        <li>We may reject withdrawals suspected of fraud or abuse</li>
                    </ul>
                </section>

                {/* Section 11 */}
                <section className="terms-section">
                    <h2>11. Refund Policy</h2>
                    <p>Because Bonkly uses blockchain transactions:</p>
                    <ul>
                        <li>BONK deposits are <strong>non-refundable</strong></li>
                        <li>BONK used for AI credits, Laughs, or fees is <strong>non-refundable</strong></li>
                        <li>AI credit purchases are final unless required by law</li>
                        <li>Contest entries and votes are <strong>non-refundable</strong></li>
                        <li>Erroneous transactions, incorrect wallet addresses, or user mistakes are <strong>not refundable</strong></li>
                    </ul>
                </section>

                {/* Section 12 */}
                <section className="terms-section">
                    <h2>12. Cookie Policy</h2>
                    <p>Bonkly uses:</p>
                    <ul>
                        <li>Cookies</li>
                        <li>Local storage</li>
                        <li>Analytics tags</li>
                        <li>Device identifiers</li>
                    </ul>
                    <p>To provide:</p>
                    <ul>
                        <li>Personalized feed recommendations</li>
                        <li>Authentication persistence</li>
                        <li>App performance and optimization</li>
                        <li>Fraud detection</li>
                        <li>Analytics</li>
                    </ul>
                    <p>Users may disable cookies, but the app may not function properly.</p>
                </section>

                {/* Section 13 */}
                <section className="terms-section">
                    <h2>13. Risk Disclosure (Crypto & AI)</h2>
                    <p>Using Bonkly involves inherent risks:</p>
                    <ul>
                        <li>Crypto volatility</li>
                        <li>Smart contract bugs</li>
                        <li>AI hallucinations</li>
                        <li>Third-party wallet or network outages</li>
                        <li>Loss of private keys</li>
                        <li>Inaccurate or offensive content</li>
                        <li>Permanent loss of assets due to user error</li>
                        <li>Regulatory changes affecting service availability</li>
                    </ul>
                    <p>Bonkly is <strong>not liable</strong> for:</p>
                    <ul>
                        <li>Lost crypto</li>
                        <li>Market losses</li>
                        <li>Gas fees</li>
                        <li>Wallet hacks</li>
                        <li>AI misuse</li>
                        <li>Incorrect withdrawals</li>
                    </ul>
                    <p>Use at your own risk.</p>
                </section>

                {/* Section 14 */}
                <section className="terms-section">
                    <h2>14. End-User License Agreement (EULA)</h2>
                    <p>By using the app:</p>
                    <ul>
                        <li>You receive a personal, non-transferable, revocable license</li>
                        <li>You may not reverse engineer, copy, or redistribute the app</li>
                        <li>You may not exploit vulnerabilities or misuse smart contracts</li>
                        <li>You may not use bots or automation tools</li>
                        <li>You may not duplicate or resell Bonkly's IP</li>
                    </ul>
                    <p>Bonkly may terminate access at any time for violations.</p>
                </section>

                {/* Section 15 */}
                <section className="terms-section">
                    <h2>15. Token & Reward Disclaimer</h2>
                    <ul>
                        <li>BONK is a third-party token</li>
                        <li>dBONK/Laugh Power is not a currency</li>
                        <li>Bonkly does not sell securities or investments</li>
                        <li>Rewards are not guaranteed</li>
                        <li>Engagement metrics may vary</li>
                        <li>Reward systems may change at any time</li>
                    </ul>
                    <p>Nothing in Bonkly constitutes investment advice.</p>
                </section>

                {/* Section 16 */}
                <section className="terms-section">
                    <h2>16. Prohibited Activities</h2>
                    <p>You may NOT:</p>
                    <ul>
                        <li>Upload illegal, harmful, or copyrighted content</li>
                        <li>Artificially inflate reactions</li>
                        <li>Use multiple accounts to manipulate rankings</li>
                        <li>Use bots or automation</li>
                        <li>Attempt to hack, exploit, or reverse engineer Bonkly</li>
                        <li>Circumvent reward systems</li>
                        <li>Engage in fraud or money laundering</li>
                    </ul>
                    <p>Violations may result in bans, forfeited BONK, and legal action.</p>
                </section>

                {/* Section 17 */}
                <section className="terms-section">
                    <h2>17. Termination</h2>
                    <p>Bonkly may suspend or terminate accounts:</p>
                    <ul>
                        <li>For violating these Terms</li>
                        <li>For fraud or suspicious activity</li>
                        <li>For posting prohibited content</li>
                        <li>If legally required</li>
                        <li>If system integrity is threatened</li>
                    </ul>
                    <p>Termination may result in loss of dBONK, rewards, or access.</p>
                </section>

                {/* Section 18 */}
                <section className="terms-section">
                    <h2>18. Changes to Terms</h2>
                    <p>Bonkly may modify these Terms at any time.</p>
                    <p>Updated versions will be posted with a new "Last Updated" date.</p>
                    <p>Continued use constitutes acceptance of changes.</p>
                </section>

                {/* Section 19 */}
                <section className="terms-section">
                    <h2>19. Governing Law</h2>
                    <p>These Terms are governed by the laws of the <strong>Cayman Islands</strong>.</p>
                    <p>
                        All disputes shall be resolved through binding arbitration
                        under Cayman Islands procedures.
                    </p>
                </section>

                {/* Section 20 */}
                <section className="terms-section">
                    <h2>20. Contact Information</h2>
                    <p>For legal, DMCA, or policy questions:</p>
                    <p><strong>Email:</strong> hi@bonkly.meme</p>
                    <p><strong>Website:</strong> bonkly.meme</p>
                </section>
            </div>
        </div>
    );
}