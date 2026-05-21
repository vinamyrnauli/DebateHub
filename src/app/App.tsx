import { useState, useEffect, useCallback, useRef } from "react";
import {
  Menu,
  X,
  Users,
  Trophy,
  MessageSquare,
  TrendingUp,
  Search,
  UserPlus,
  BookOpen,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Target,
  Clock,
  Lightbulb,
  MapPin,
  Calendar,
} from "lucide-react";

const FEATURE_CARDS = [
  {
    Icon: Trophy,
    title: "Tournament Discovery",
    description:
      "Find tournament details, deadlines, categories, and registration information all in one place.",
    accent: false,
  },
  {
    Icon: Users,
    title: "Team & Coach Matching",
    description:
      "Connect with teammates, coaches, and sparring partners that match your skill level and goals.",
    accent: false,
  },
  {
    Icon: BookOpen,
    title: "Motion Bank",
    description:
      "Access a structured library of debate motions to sharpen your arguments and prepare effectively.",
    accent: true,
  },
  {
    Icon: TrendingUp,
    title: "Performance Tracking",
    description:
      "Monitor your debate progress with detailed analytics and identify your areas for growth.",
    accent: false,
  },
];

function FeatureCard({
  card,
}: {
  card: (typeof FEATURE_CARDS)[0];
}) {
  const { Icon, title, description, accent } = card;
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-border h-full flex flex-col">
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-md flex-shrink-0 ${
          accent
            ? "bg-gradient-to-br from-accent to-accent/80"
            : "bg-gradient-to-br from-primary to-primary/80"
        }`}
      >
        <Icon
          className={`w-7 h-7 ${accent ? "text-accent-foreground" : "text-white"}`}
        />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCarousel() {
  const N = FEATURE_CARDS.length; // 4

  // Desktop: show 3 cards → need 3 trailing clones for seamless loop (7 total)
  const desktopCards = [
    ...FEATURE_CARDS,
    FEATURE_CARDS[0],
    FEATURE_CARDS[1],
    FEATURE_CARDS[2],
  ];
  // Mobile: show 1 card → need 1 trailing clone (5 total)
  const mobileCards = [...FEATURE_CARDS, FEATURE_CARDS[0]];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    // Backward: jump without animation to avoid needing leading clones
    setIsTransitioning(false);
    setCurrentIndex((prev) => (prev - 1 + N) % N);
  }, [N]);

  // After silently jumping, re-enable transitions on the next paint
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => setIsTransitioning(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Auto-rotation
  useEffect(() => {
    if (isHovered) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(goNext, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, goNext]);

  const handleTransitionEnd = () => {
    // When we've moved past the real cards into the clone zone, silently reset
    if (currentIndex >= N) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - N);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    setTouchStart(null);
  };

  const activeIndex = currentIndex % N;
  const transitionValue = isTransitioning
    ? "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)"
    : "none";

  // Desktop track: 7 cards, 3 visible → track width = (7/3)*100% of container
  const desktopTrackStyle: React.CSSProperties = {
    width: `${(desktopCards.length / 3) * 100}%`,
    transform: `translateX(-${currentIndex * (100 / desktopCards.length)}%)`,
    transition: transitionValue,
    display: "flex",
  };

  // Mobile track: 5 cards, 1 visible → track width = 5*100% of container
  const mobileTrackStyle: React.CSSProperties = {
    width: `${mobileCards.length * 100}%`,
    transform: `translateX(-${currentIndex * (100 / mobileCards.length)}%)`,
    transition: transitionValue,
    display: "flex",
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Desktop Carousel — shows 3 cards at once */}
      <div className="hidden md:block overflow-hidden">
        <div style={desktopTrackStyle} onTransitionEnd={handleTransitionEnd}>
          {desktopCards.map((card, i) => (
            <div
              key={i}
              style={{ width: `${100 / desktopCards.length}%` }}
              className="flex-shrink-0 px-3 py-2"
            >
              <FeatureCard card={card} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Carousel — shows 1 card at a time with swipe */}
      <div
        className="md:hidden overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={mobileTrackStyle} onTransitionEnd={handleTransitionEnd}>
          {mobileCards.map((card, i) => (
            <div
              key={i}
              style={{ width: `${100 / mobileCards.length}%` }}
              className="flex-shrink-0 px-2 py-2"
            >
              <FeatureCard card={card} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2.5 mt-8">
        {FEATURE_CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsTransitioning(false);
              setCurrentIndex(i);
            }}
            aria-label={`View ${FEATURE_CARDS[i].title}`}
            className={`h-2.5 rounded-full transition-all duration-400 ${
              activeIndex === i
                ? "bg-primary w-7"
                : "bg-gray-300 hover:bg-gray-400 w-2.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Product Preview components ────────────────────────────────────────────

function BrowserMockup({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-white flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Chrome bar */}
      <div className="bg-gray-50 border-b border-border px-3 py-2.5 flex items-center gap-2 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#FF605C]" />
          <div className="w-2 h-2 rounded-full bg-[#FFBD44]" />
          <div className="w-2 h-2 rounded-full bg-[#00CA4E]" />
        </div>
        <div className="flex-1 bg-white border border-border rounded-md px-2 py-0.5 mx-2">
          <span className="text-[10px] text-muted-foreground">
            debatehub.app/
            {label.toLowerCase().replace(/ /g, "-")}
          </span>
        </div>
      </div>
      {/* Screen content */}
      <div className="flex-1 bg-[#FAFBFF] overflow-hidden">{children}</div>
      {/* Footer label */}
      <div className="bg-white border-t border-border px-3 py-2 flex-shrink-0">
        <p className="text-[11px] font-semibold text-foreground">{label}</p>
      </div>
    </div>
  );
}

function TournamentScreen() {
  const tournaments = [
    { name: "National BP Championship", date: "Jun 15", cat: "BP", loc: "Jakarta", hot: true },
    { name: "Asian Debate Open 2024", date: "Jul 02", cat: "Asian", loc: "Singapore", hot: false },
    { name: "University League S3", date: "Jul 20", cat: "BP", loc: "Bandung", hot: false },
  ];
  return (
    <div className="p-3 space-y-2.5">
      <div className="bg-white rounded-lg px-2.5 py-2 flex items-center gap-2 border border-border">
        <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground">Search tournaments...</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {["All", "BP", "Asian", "WSDC"].map((tag, i) => (
          <span
            key={tag}
            className={`px-2 py-0.5 text-[9px] rounded-full ${
              i === 0
                ? "bg-primary text-white"
                : "bg-white border border-border text-muted-foreground"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
      {tournaments.map((t, i) => (
        <div key={i} className="bg-white rounded-xl p-2.5 border border-border">
          <div className="flex justify-between items-start mb-1.5 gap-1">
            <span className="text-[11px] font-semibold text-foreground leading-tight">
              {t.name}
            </span>
            <span className="text-[9px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full flex-shrink-0">
              {t.cat}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <Calendar className="w-2.5 h-2.5" />
              {t.date}
            </span>
            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />
              {t.loc}
            </span>
            {t.hot && (
              <span className="text-[9px] text-orange-500 font-medium">🔥 Hot</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamScreen() {
  const people = [
    { name: "Rina Sari", role: "Debater", match: 94, init: "R", cls: "bg-blue-100 text-blue-600" },
    { name: "Budi Santoso", role: "Coach", match: 89, init: "B", cls: "bg-accent text-accent-foreground" },
    { name: "Dewi Ayu", role: "Debater", match: 81, init: "D", cls: "bg-purple-100 text-purple-600" },
    { name: "Ahmad Yusuf", role: "Debater", match: 76, init: "A", cls: "bg-green-100 text-green-600" },
  ];
  return (
    <div className="p-3 space-y-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-semibold text-foreground">Top Matches For You</span>
        <span className="text-[10px] text-primary cursor-pointer">See all</span>
      </div>
      {people.map((p, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-2 border border-border flex items-center gap-2.5"
        >
          <div
            className={`w-8 h-8 ${p.cls} rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-[11px]`}
          >
            {p.init}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-foreground">{p.name}</p>
            <p className="text-[9px] text-muted-foreground">{p.role}</p>
            <div className="mt-1 bg-secondary rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full"
                style={{ width: `${p.match}%` }}
              />
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-bold text-primary">{p.match}%</p>
            <p className="text-[8px] text-muted-foreground">match</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MotionScreen() {
  const motions = [
    { text: "THW ban cryptocurrency as a medium of exchange", cat: "Economy", hard: true },
    { text: "THBT governments should subsidize electric vehicles", cat: "Tech", hard: false },
    { text: "TH supports implementing universal basic income", cat: "Social", hard: true },
    { text: "THW allow private entities to own national parks", cat: "Enviro", hard: false },
  ];
  return (
    <div className="p-3 space-y-2">
      <div className="flex gap-1.5 flex-wrap mb-1">
        {["Economy", "Tech", "Social", "Enviro"].map((cat, i) => (
          <span
            key={cat}
            className={`px-2 py-0.5 text-[9px] rounded-full ${
              i === 0
                ? "bg-primary text-white"
                : "bg-white border border-border text-muted-foreground"
            }`}
          >
            {cat}
          </span>
        ))}
      </div>
      {motions.map((m, i) => (
        <div key={i} className="bg-white rounded-xl p-2.5 border border-border">
          <p className="text-[10px] text-foreground leading-relaxed mb-1.5">{m.text}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
              {m.cat}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                m.hard ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {m.hard ? "Hard" : "Medium"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PerformanceScreen() {
  const bars = [45, 68, 55, 82, 73, 91];
  const months = ["J", "F", "M", "A", "M", "J"];
  const results = [
    { name: "BP National", pos: "1st", win: true },
    { name: "Asian Open", pos: "3rd", win: false },
    { name: "Univ. League", pos: "2nd", win: true },
  ];
  return (
    <div className="p-3 space-y-2.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold text-foreground">My Stats</span>
        <span className="text-[9px] text-muted-foreground">Season 2024</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Wins", value: "24", color: "text-green-600", bg: "bg-green-50" },
          { label: "Losses", value: "8", color: "text-red-500", bg: "bg-red-50" },
          { label: "Rating", value: "87", color: "text-primary", bg: "bg-secondary" },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-xl p-2 text-center border border-border`}
          >
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[8px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-2.5 border border-border">
        <p className="text-[9px] text-muted-foreground mb-2">Win Rate (Last 6 Months)</p>
        <div className="flex items-end gap-1 h-10">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex items-end">
              <div
                className="w-full rounded-t-sm bg-primary/80"
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex mt-1">
          {months.map((m, i) => (
            <span key={i} className="flex-1 text-[8px] text-muted-foreground text-center">
              {m}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {results.map((r, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-2.5 py-1.5 ${
              i < results.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="text-[10px] text-foreground">{r.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground">{r.pos}</span>
              <div
                className={`w-1.5 h-1.5 rounded-full ${r.win ? "bg-green-500" : "bg-red-400"}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductPreview() {
  const screens = [
    { label: "Tournament Discovery", content: <TournamentScreen /> },
    { label: "Team Matching", content: <TeamScreen /> },
    { label: "Motion Bank", content: <MotionScreen /> },
    { label: "Performance Tracking", content: <PerformanceScreen /> },
  ];

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-secondary rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            See DebateHub in Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Explore how DebateHub helps debaters discover tournaments, connect
            with teammates, access motions, and track their progress in one
            simple platform.
          </p>
        </div>

        {/* Desktop / tablet grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-start">
          {screens.map((screen, i) => (
            <div
              key={i}
              className={i === 1 || i === 2 ? "lg:mt-6" : ""}
            >
              <BrowserMockup label={screen.label}>
                {screen.content}
              </BrowserMockup>
            </div>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div
          className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4"
          style={{ scrollbarWidth: "none" }}
        >
          {screens.map((screen, i) => (
            <div key={i} className="snap-start flex-shrink-0 w-[82vw]">
              <BrowserMockup label={screen.label}>
                {screen.content}
              </BrowserMockup>
            </div>
          ))}
        </div>

        {/* Mobile scroll hint */}
        <p className="md:hidden text-center text-[11px] text-muted-foreground mt-3">
          Swipe to explore more screens →
        </p>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                DebateHub
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#home"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Pricing
              </a>
              <a
                href="#community"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Community
              </a>
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center">
              <a
                href="https://www.figma.com/proto/your-prototype-link"
                className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <a
                  href="#home"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#pricing"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#community"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Community
                </a>
                <a
                  href="https://www.figma.com/proto/your-prototype-link"
                  className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm text-center"
                >
                  Get Started
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Discover Tournaments, Find Your Team, and Grow as a Debater.
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  DebateHub brings tournament discovery, team and coach
                  matching, motion banks, and performance tracking into one
                  platform for the parliamentary debate community.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.figma.com/proto/your-prototype-link"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-all"
                >
                  Explore Features
                </a>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-secondary via-white to-accent/20 rounded-3xl p-8 lg:p-12 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-white/60 rounded-full w-3/4 mb-2"></div>
                      <div className="h-3 bg-white/40 rounded-full w-1/2"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                      <Trophy className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-white/60 rounded-full w-2/3 mb-2"></div>
                      <div className="h-3 bg-white/40 rounded-full w-1/3"></div>
                    </div>
                  </div>

                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-primary/20 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-accent/30 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Debate preparation should not be scattered.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Scattered tournament information
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Tournament details spread across multiple platforms make it
                hard to discover and track opportunities.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6">
                <UserPlus className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Limited access to teammates and coaches
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Finding the right debate partner or coach is difficult without
                a centralized platform.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Unstructured practice and performance tracking
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                No systematic way to track progress and improvement makes it
                hard to identify growth areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section — with animated carousel */}
      <section id="features" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Everything debaters need in one platform.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for every stage of your debate journey — from your first
              tournament to your hundredth.
            </p>
          </div>

          <FeatureCarousel />
        </div>
      </section>

      <ProductPreview />

      {/* User Segment Section */}
      <section
        id="community"
        className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/20 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Built for the debate ecosystem.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                Active Debaters
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Discover tournaments, find teammates, practice with motion
                banks, and track your competitive journey.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Tournament calendar and registration
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Partner and coach matching
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Performance analytics
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                Coaches &amp; Alumni
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Connect with aspiring debaters, share expertise, and
                contribute to the debate community&apos;s growth.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Find students to mentor
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Share training resources
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Build coaching reputation
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                Tournament Organizers
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Manage registrations, promote your events, and connect with
                the parliamentary debate community.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Centralized event management
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Reach wider audience
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Streamlined registration
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Start your debate journey in three simple steps.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all border-2 border-secondary">
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    Create your profile
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Set up your debater profile with your experience level,
                    interests, and goals to get personalized recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all border-2 border-secondary">
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    Discover tournaments, teammates, coaches, and motions
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Browse upcoming tournaments, connect with potential
                    partners, and access motion banks for practice.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all border-2 border-secondary">
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    Prepare and track your progress
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Use performance tracking tools to monitor your growth and
                    identify areas for improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/10 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Choose the plan that fits your needs.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all border border-border">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Free
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    Rp0
                  </span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Basic tournament discovery
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Limited motion bank access
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Basic profile
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Community access
                  </span>
                </li>
              </ul>
              <button className="w-full px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-all">
                Get Started
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent px-4 py-1 text-xs font-semibold text-accent-foreground rounded-bl-lg">
                Popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Pro
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    Rp150.000
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  one-time payment
                </p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Full tournament discovery
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Unlimited motion bank
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Team &amp; coach matching
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Performance tracking
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Priority support
                  </span>
                </li>
              </ul>
              <button className="w-full px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm">
                Upgrade to Pro
              </button>
            </div>

            {/* Organizational Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all border border-border">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Organizational
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    Rp1.500.000
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">per event</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Event management tools
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Registration system
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Participant analytics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Promotional support
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Dedicated support
                  </span>
                </li>
              </ul>
              <button className="w-full px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-8 lg:p-16 text-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to prepare smarter for your next debate competition?
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
              Join DebateHub and start discovering tournaments, building your
              team, and tracking your debate growth in one place.
            </p>
            <a
              href="https://www.figma.com/proto/your-prototype-link"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/95 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Debate Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold text-foreground">
                  DebateHub
                </div>
                <div className="text-sm text-muted-foreground">
                  Connecting debaters, coaches, and organizers in one platform.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Contact Us
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 DebateHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
