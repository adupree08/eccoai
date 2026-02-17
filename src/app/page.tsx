import Link from "next/link";
import {
  Zap,
  User,
  Rss,
  Check,
  PenSquare,
  Calendar,
  LayoutDashboard,
  Plus,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-white/95 backdrop-blur-md border-b border-ecco">
        <div className="max-w-[1180px] mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-ecco-navy">ecco</span>
            <span className="text-ecco-blue">ai</span>
          </Link>
          <ul className="hidden md:flex items-center gap-9">
            <li>
              <a href="#features" className="text-sm font-medium text-ecco-secondary hover:text-ecco-navy transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="text-sm font-medium text-ecco-secondary hover:text-ecco-navy transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#use-cases" className="text-sm font-medium text-ecco-secondary hover:text-ecco-navy transition-colors">
                Use Cases
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-ecco-secondary hover:text-ecco-navy transition-colors">
              Login
            </Link>
            <Link href="/signup">
              <Button className="bg-ecco-navy hover:bg-ecco-navy-light">
                Join Beta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-24 min-h-screen bg-gradient-to-br from-ecco-off-white via-ecco-accent-light to-[#D4E4F5] overflow-hidden">
        {/* Background blobs - purple and blue */}
        <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[150%] bg-[radial-gradient(ellipse,rgba(99,102,241,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[60%] h-full bg-[radial-gradient(ellipse,rgba(123,163,212,0.3)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-[1180px] mx-auto px-6 relative z-10">
          <div className="text-center max-w-[720px] mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-ecco rounded-full px-5 py-2 text-sm font-medium text-ecco-accent mb-7 shadow-sm">
              <Zap className="w-4 h-4" />
              Now in Beta — Early Access Available
            </div>

            <h1 className="text-4xl md:text-[52px] font-extrabold leading-[1.12] tracking-tight text-ecco-navy mb-6">
              LinkedIn content that{" "}
              <span className="bg-gradient-to-r from-ecco-accent to-ecco-blue bg-clip-text text-transparent">echoes you</span>, not generic AI
            </h1>

            <p className="text-lg md:text-xl text-ecco-secondary mb-9 max-w-[580px] mx-auto leading-relaxed">
              Train your brand voice, curate your own RSS feeds for fresh ideas,
              and create authentic LinkedIn posts that sound like you wrote them.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup">
                <Button size="lg" className="bg-ecco-navy hover:bg-ecco-navy-light text-base px-7">
                  Request Early Access
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-7">
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-7 text-sm text-ecco-tertiary">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-ecco-accent" />
                Free during beta
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-ecco-accent" />
                No credit card
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-ecco-accent" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="mt-16 hidden md:block">
            <div className="bg-white rounded-2xl shadow-2xl border border-ecco overflow-hidden max-w-[980px] mx-auto">
              {/* Browser dots */}
              <div className="bg-ecco-off-white px-4 py-3 flex items-center gap-2 border-b border-ecco">
                <span className="w-3 h-3 rounded-full bg-red-300" />
                <span className="w-3 h-3 rounded-full bg-yellow-300" />
                <span className="w-3 h-3 rounded-full bg-green-300" />
              </div>

              <div className="flex min-h-[480px]">
                {/* Sidebar */}
                <div className="w-[200px] bg-white border-r border-ecco p-5">
                  <div className="text-lg font-bold mb-6">
                    <span className="text-ecco-navy">ecco</span>
                    <span className="text-ecco-blue">ai</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-ecco-accent-light text-ecco-blue text-sm font-medium">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-ecco-tertiary text-sm font-medium">
                      <Plus className="w-4 h-4" />
                      Create Post
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-ecco-tertiary text-sm font-medium">
                      <Rss className="w-4 h-4" />
                      Feeds
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-ecco-tertiary text-sm font-medium">
                      <Library className="w-4 h-4" />
                      Library
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-ecco-tertiary text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      Calendar
                    </div>
                  </div>
                </div>

                {/* Main */}
                <div className="flex-1 p-6 bg-ecco-off-white">
                  <h2 className="text-xl font-bold text-ecco-navy mb-4">Create Post</h2>
                  <div className="inline-flex bg-white border border-ecco rounded-lg p-1 mb-4">
                    <span className="px-3 py-1.5 text-xs font-medium bg-ecco-navy text-white rounded-md">From Idea</span>
                    <span className="px-3 py-1.5 text-xs font-medium text-ecco-tertiary">From URL</span>
                    <span className="px-3 py-1.5 text-xs font-medium text-ecco-tertiary">From RSS</span>
                  </div>
                  <div className="bg-white border border-ecco rounded-xl p-5">
                    <p className="text-[11px] font-semibold text-ecco-secondary uppercase tracking-wide mb-2">What&apos;s your post about?</p>
                    <div className="bg-ecco-off-white border border-ecco rounded-md p-3 text-xs text-ecco-secondary mb-4 h-16">
                      Building a remote-first company changed everything about how we collaborate...
                    </div>
                    <p className="text-[11px] font-semibold text-ecco-secondary uppercase tracking-wide mb-2">Variations</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-ecco-blue text-white">Storytelling</span>
                      <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-ecco-off-white text-ecco-tertiary">Actionable</span>
                      <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-ecco-blue text-white">Thought-provoking</span>
                    </div>
                    <Button size="sm" className="bg-ecco-navy hover:bg-ecco-navy-light text-xs">
                      Generate Posts
                    </Button>
                  </div>
                </div>

                {/* Panel */}
                <div className="w-[260px] p-5 bg-white border-l border-ecco hidden lg:block">
                  <h3 className="text-sm font-semibold text-ecco-navy mb-4">Format & Tone</h3>
                  <div className="mb-4">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ecco-muted mb-2">Format</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-ecco-off-white text-ecco-tertiary">Listicle</span>
                      <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-ecco-blue text-white">Concise</span>
                      <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-ecco-off-white text-ecco-tertiary">Long-form</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ecco-muted mb-2">Tone</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-ecco-blue text-white">Enthusiastic</span>
                      <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-ecco-off-white text-ecco-tertiary">Friendly</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ecco-muted mb-2">Brand Voice</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-ecco-blue text-white">Your Custom Voice</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-24 bg-white">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="px-5">
              <div className="w-16 h-16 bg-gradient-to-br from-ecco-accent-light to-ecco-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <User className="w-7 h-7 text-ecco-accent" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl font-bold text-ecco-navy mb-2.5">Your Voice, Amplified</h3>
              <p className="text-[15px] text-ecco-secondary leading-relaxed">
                Train eccoai on your writing style through conversation or examples. Every post echoes your authentic voice — not generic AI speak.
              </p>
            </div>
            <div className="px-5">
              <div className="w-16 h-16 bg-gradient-to-br from-ecco-accent-light via-[#E0E7FF] to-[#D4E4F5] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Rss className="w-7 h-7 text-ecco-blue" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl font-bold text-ecco-navy mb-2.5">Your RSS, Your Ideas</h3>
              <p className="text-[15px] text-ecco-secondary leading-relaxed">
                Curate custom news feeds based on your industry and interests. Fresh content ideas delivered daily, tailored to your niche.
              </p>
            </div>
            <div className="px-5">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4E4F5] to-ecco-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Zap className="w-7 h-7 text-ecco-blue" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl font-bold text-ecco-navy mb-2.5">10x Faster Creation</h3>
              <p className="text-[15px] text-ecco-secondary leading-relaxed">
                Go from idea to polished post in minutes. Multiple variations, one click. Spend less time writing, more time engaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-ecco-off-white">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-ecco-accent mb-3.5">Features</p>
            <h2 className="text-3xl md:text-[40px] font-extrabold text-ecco-navy tracking-tight mb-4">
              Everything you need for LinkedIn growth
            </h2>
            <p className="text-lg text-ecco-secondary max-w-[540px] mx-auto leading-relaxed">
              From personalized content creation to strategic engagement, build your presence without the time drain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            {[
              { icon: PenSquare, title: "AI Content Generation", desc: "Transform ideas, URLs, or news feeds into polished posts. Multiple variations with different styles and angles." },
              { icon: User, title: "Brand Voice Training", desc: "Teach AI your unique style through guided conversation or by sharing examples. Posts sound like you, not a template." },
              { icon: Rss, title: "Custom RSS Feeds", desc: "Build your own content pipeline. Add industry news, competitor blogs, or any source. Never run out of fresh ideas." },
              { icon: Calendar, title: "Content Calendar", desc: "Plan and organize your posts visually. Schedule ahead and maintain consistency without the daily scramble." },
            ].map((feature, i) => (
              <div key={i} className="bg-white border border-ecco rounded-2xl p-7 transition-all hover:border-ecco-accent/40 hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-ecco-accent-light to-ecco-accent/20 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-ecco-accent" strokeWidth={1.75} />
                </div>
                <h3 className="text-[17px] font-bold text-ecco-navy mb-2">{feature.title}</h3>
                <p className="text-sm text-ecco-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ecco-accent mb-3.5">How It Works</p>
              <h2 className="text-3xl md:text-[40px] font-extrabold text-ecco-navy tracking-tight mb-5">
                From blank page to brilliant post
              </h2>
              <p className="text-[17px] text-ecco-secondary leading-relaxed mb-10">
                A simple workflow that saves hours every week while making your content more authentic and engaging.
              </p>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[23px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-ecco-accent-light via-ecco-accent/30 to-ecco-blue-soft rounded-full" />

                <div className="space-y-0">
                  {[
                    { num: 1, title: "Train your voice", desc: "Share examples or chat with AI to capture your unique style. Done once, applied forever." },
                    { num: 2, title: "Pick your source", desc: "Start from an idea, your RSS feeds, a URL, or browse viral posts for inspiration." },
                    { num: 3, title: "Generate & refine", desc: "Get multiple variations in your voice. Edit inline or use AI to polish until perfect." },
                    { num: 4, title: "Publish or schedule", desc: "Copy to LinkedIn, save for later, or add to your calendar. Track what resonates." },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-5 py-4 relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-ecco-accent to-ecco-blue rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 shadow-md relative z-10">
                        {step.num}
                      </div>
                      <div>
                        <h4 className="text-[17px] font-bold text-ecco-navy mb-1">{step.title}</h4>
                        <p className="text-sm text-ecco-tertiary leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="order-first lg:order-last">
              <div className="bg-gradient-to-br from-ecco-accent-light via-[#E0E7FF] to-[#D4E4F5] rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-30%] w-[80%] h-[150%] bg-[radial-gradient(ellipse,rgba(255,255,255,0.4)_0%,transparent_60%)] pointer-events-none" />

                {/* Floating badge top */}
                <div className="absolute top-5 left-[-20px] bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2.5 text-xs font-semibold text-ecco-navy z-10 hidden lg:flex">
                  <Check className="w-4 h-4 text-ecco-accent" />
                  Brand voice applied
                </div>

                <div className="bg-white rounded-xl p-5 shadow-xl relative z-10">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-ecco">
                    <div className="w-9 h-9 bg-gradient-to-br from-ecco-accent to-ecco-blue rounded-full" />
                    <div>
                      <p className="text-sm font-semibold text-ecco-navy">Your Name</p>
                      <p className="text-xs text-ecco-tertiary">Posting to LinkedIn</p>
                    </div>
                  </div>
                  <div className="text-sm text-ecco-secondary leading-relaxed mb-4">
                    <strong className="text-ecco-navy">Building a remote team taught me something unexpected:</strong>
                    <br /><br />
                    The best meetings are the ones that never happen.
                    <br /><br />
                    We replaced our daily standups with async updates. Result?
                    <br />
                    → 40% more deep work time
                    <br />
                    → Higher team satisfaction
                    <br />
                    → Better documentation
                    <br /><br />
                    What&apos;s one meeting you could replace with a Slack message?
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-ecco-navy hover:bg-ecco-navy-light text-xs">Copy to LinkedIn</Button>
                    <Button size="sm" variant="outline" className="text-xs">Schedule</Button>
                    <Button size="sm" variant="outline" className="text-xs">Edit</Button>
                  </div>
                </div>

                {/* Floating badge bottom */}
                <div className="absolute bottom-5 right-[-20px] bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2.5 text-xs font-semibold text-ecco-navy z-10 hidden lg:flex">
                  <Rss className="w-4 h-4 text-ecco-blue" />
                  From your RSS feed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="py-24 bg-ecco-off-white">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ecco-accent mb-3.5">Use Cases</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-ecco-navy tracking-tight mb-4">
                Built for busy professionals
              </h3>
              <p className="text-base text-ecco-secondary leading-relaxed mb-7">
                Whether you&apos;re a founder, consultant, or marketer, eccoai helps you maintain a consistent presence without sacrificing your day.
              </p>
              <ul className="space-y-5">
                {[
                  { title: "Founders & Executives", desc: "Share insights and build thought leadership in your authentic voice" },
                  { title: "Consultants & Coaches", desc: "Attract clients by consistently sharing valuable content in your niche" },
                  { title: "Marketing Teams", desc: "Scale personal branding across your team with consistent quality" },
                  { title: "Sales Professionals", desc: "Stay top of mind with prospects through regular, engaging posts" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <Check className="w-5 h-5 text-ecco-accent flex-shrink-0 mt-0.5" />
                    <span className="text-[15px] text-ecco-secondary leading-relaxed">
                      <strong className="text-ecco-navy">{item.title}</strong> — {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-ecco-accent-light via-[#E0E7FF] to-[#D4E4F5] rounded-3xl p-8">
              <div className="bg-white rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-ecco-accent to-ecco-blue rounded-full" />
                  <div>
                    <p className="text-sm font-semibold text-ecco-navy">Sarah Chen</p>
                    <p className="text-xs text-ecco-tertiary">CEO @ TechStartup</p>
                  </div>
                </div>
                <div className="text-sm text-ecco-secondary leading-relaxed mb-4">
                  I used to spend 3 hours on one LinkedIn post.
                  <br /><br />
                  Now I spend 15 minutes and get better results.
                  <br /><br />
                  The secret? I stopped trying to be perfect and started being consistent.
                  <br /><br />
                  Here&apos;s what changed:
                  <br />
                  • Batched my content creation
                  <br />
                  • Used AI that actually sounds like me
                  <br />
                  • Focused on sharing real experiences
                  <br /><br />
                  What&apos;s holding you back from posting more?
                </div>
                <div className="flex gap-5 text-xs text-ecco-tertiary pt-3 border-t border-ecco">
                  <span>847 likes</span>
                  <span>92 comments</span>
                  <span>24 reposts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 text-center bg-gradient-to-br from-ecco-off-white via-ecco-accent-light to-[#D4E4F5] relative overflow-hidden">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-full h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.5)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-[1180px] mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-[42px] font-extrabold text-ecco-navy tracking-tight mb-4">
            Ready to find your LinkedIn voice?
          </h2>
          <p className="text-lg text-ecco-secondary mb-9 max-w-[500px] mx-auto leading-relaxed">
            Join our beta and start creating content that sounds like you. Limited spots available for early access.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-ecco-navy hover:bg-ecco-navy-light text-base px-7">
              Request Early Access
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-7 mt-8 text-sm text-ecco-tertiary">
            <span>Free during beta</span>
            <span>No credit card required</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 bg-ecco-navy text-white">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="text-xl font-bold mb-4">
                ecco<span className="text-ecco-accent/80">ai</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-[260px]">
                AI-powered LinkedIn content that echoes your authentic voice. Build your presence without losing yourself.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">&copy; 2025 eccoai. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
