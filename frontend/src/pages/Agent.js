import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRive } from "rive-react";
import StickyNavbar from "../components/StickyNavbar";
import RobotBubble from "../components/RobotBubble";
import { useEffect, useState } from "react";

function TypingText({ text = "", speed = 50, loop = true }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!text) return;

    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (loop) {
      const resetTimeout = setTimeout(() => {
        setDisplayedText("");
        setIndex(0);
      }, 10000);
      return () => clearTimeout(resetTimeout);
    }
  }, [index, text, speed, loop]);

  return (
    <span
      className="text-sm text-white opacity-90 whitespace-nowrap inline-block overflow-hidden"
      style={{ width: "100%", maxWidth: "400px" }}
    >
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  const { rive: heroRive, RiveComponent: HeroBot } = useRive({
    src: "/hustler-robot.riv",
    autoplay: true,
    stateMachines: ["State Machine 1"],
  });

  const { rive: bubbleRive, RiveComponent: BubbleBot } = useRive({
    src: "/hustler-bubble-bot.riv",
    autoplay: true,
    stateMachines: ["State Machine 1"],
  });

  useEffect(() => {
    const handleMouse = (x) => {
      const mouseX = x / window.innerWidth;
      const heroInput = heroRive?.inputs?.find((i) => i.name === "mouseX");
      const bubbleInput = bubbleRive?.inputs?.find((i) => i.name === "mouseX");
      if (heroInput) heroInput.value = mouseX;
      if (bubbleInput) bubbleInput.value = mouseX;
    };

    const onMouseMove = (e) => handleMouse(e.clientX);
    const onScroll = () => handleMouse(window.scrollY % window.innerWidth);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [heroRive, bubbleRive]);

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const featureCards = [
    {
      title: "مساحتك الآمنة",
      desc: "مكان يساعدك على فهم نفسك والتعبير عن مشاعرك بحرية وأمان.",
      moreInfo: `في "تقدر"، نؤمن أن الصحة النفسية حق للجميع.
      
هنا ستجد بيئة داعمة تُشعرك بالراحة والأمان لتتحدث عن مشاعرك بدون خوف من الحكم عليك.
      
نقدّم أدوات تساعدك على تقبّل ذاتك، ومحتوى يساعدك على التوازن النفسي.`,
    },
    {
      title: "مساعدة فورية",
      desc: "احصل على دعم نفسي أولي وإرشادات علمية من مختصين ومتطوعين.",
      moreInfo: `فريق "تقدر" يقدم لك إرشادات نفسية فورية تساعدك على التعامل مع القلق، الاكتئاب، أو الضغوط اليومية.

نحن هنا لنستمع إليك وندعمك خطوة بخطوة.`,
    },
    {
      title: "خطة تحسين نفسية",
      desc: "اصنع خطة تناسبك لتحسين صحتك النفسية بشكل مستمر.",
      moreInfo: `قم ببناء خطة شخصية تهدف لتحسين مزاجك ونمط حياتك.

من تمارين التأمل إلى تنظيم النوم والعلاقات — كل شيء مصمم لمساعدتك على الشعور بالتحسن.`,
    },
    {
      title: "مجتمع داعم",
      desc: "تواصل مع أشخاص يمرون بتجارب مشابهة وتبادلوا الدعم والتجارب.",
      moreInfo: `في مجتمع "تقدر"، أنت لست وحدك.

يمكنك مشاركة تجربتك مع آخرين في نفس المرحلة العمرية، والتفاعل في بيئة مليئة بالتفهم والدعم.`,
    },
    {
      title: "خصوصية وأمان",
      desc: "بياناتك ومحادثاتك في أمان تام ولا تُشارك مع أي طرف ثالث.",
      moreInfo: `نحن نحافظ على سريتك الكاملة.

جميع محادثاتك وبياناتك مشفرة ولا تُستخدم لأي أغراض أخرى.`,
    },
    {
      title: "تعلم عن نفسك",
      desc: "اكتشف المزيد عن صحتك النفسية وتعلم مهارات التعامل مع الضغوط.",
      moreInfo: `نقدّم مقالات، اختبارات، ودروس قصيرة تساعدك على فهم نفسك أكثر وتطوير صحتك النفسية على المدى الطويل.`,
    },
  ];

  const roadmapSteps = [
    {
      title: "ابدأ بالتعرف على نفسك",
      desc: "قم بالإجابة على بعض الأسئلة لتتعرف على حالتك النفسية الحالية.",
    },
    {
      title: "احصل على إرشاد مخصص",
      desc: "سيتم توجيهك لأفضل الحلول والتمارين المناسبة لك.",
    },
    {
      title: "تفاعل مع الدعم",
      desc: "يمكنك الدردشة مع مختصين أو متطوعين يقدمون المساعدة.",
    },
    {
      title: "تعلم وطبّق",
      desc: "اكتسب مهارات التعامل مع القلق والضغوط بشكل عملي.",
    },
    {
      title: "تابع تقدمك",
      desc: "سجّل إنجازاتك وتطورك لتشعر بالفخر بما وصلت إليه.",
    },
    {
      title: "كن مصدر دعم",
      desc: "بعد تحسنك، يمكنك مساعدة الآخرين في رحلتهم النفسية.",
    },
  ];

  return (
    <>
      
      <div className="bg-black text-white font-sans overflow-x-hidden">
        {/* HERO */}
        <section className="relative min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden">
        <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-red-900/30 via-transparent to-black pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        />
        <motion.div
        className="z-10 text-center max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        >
        <h1 className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-[0_0_25px_#ff1a1a]">
        تقدر
        </h1>
         <p className="mt-6 text-xl md:text-2xl text-gray-300">
        لأنك تقدر تتجاوز صعوباتك النفسية، خطوة بخطوة، ومع دعم من يفهمك.
        </p>
        <div className="mt-10 flex justify-center gap-6">
        <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate("/register")}
        className="bg-gradient-to-r from-red-600 to-red-900 px-8 py-4 rounded-xl font-bold text-white shadow-lg"
        >
        ابدأ رحلتك الآن
        </motion.button>
        <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate("/login")}
        className="bg-gray-800 border border-red-600 px-8 py-4 rounded-xl font-bold text-white"
        >
        تسجيل الدخول
        </motion.button>
        </div>
        </motion.div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-10 w-[700px] h-[700px] z-0 opacity-90">
        <HeroBot style={{ width: "100%", height: "100%" }} />
        </div>
        </section>


        {/* FEATURE CARDS */}
        <section className="py-36 bg-black text-white text-center px-4 md:px-12 z-10 relative">
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-20 drop-shadow-[0_0_15px_#ff1a1a]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            لماذا تختار تقدر؟
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {featureCards.map((item, index) => (
              <motion.div
                key={index}
                onClick={() => {
                  setSelectedFeature(item);
                  setShowModal(true);
                }}
                className="cursor-pointer bg-[#111] border border-transparent rounded-2xl p-6 shadow-[0_0_30px_rgba(255,26,26,0.2)] transition-all duration-300 hover:border-red-600 hover:shadow-[0_0_25px_#ff1a1a]"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-300 text-md">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* MODAL */}
        {showModal && selectedFeature && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl md:max-w-4xl max-h-[85vh] overflow-y-auto bg-[#111] text-white rounded-2xl shadow-[0_0_40px_#ff1a1a] border border-red-700 p-8 md:p-12"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-5 text-3xl font-semibold text-white hover:text-red-500"
              >
                &times;
              </button>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{selectedFeature.title}</h2>
              <pre className="whitespace-pre-wrap text-gray-300 text-lg leading-relaxed font-sans">
                {selectedFeature.moreInfo}
              </pre>
            </motion.div>
          </div>
        )}

        {/* ROADMAP */}
        <section className="py-36 bg-black relative z-10 overflow-hidden px-4 md:px-12">
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center mb-24 text-white drop-shadow-[0_0_15px_#ff1a1a]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            رحلتك مع تقدر
          </motion.h2>
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute left-1/2 top-0 h-full w-[3px] bg-gradient-to-b from-red-600 via-transparent to-black animate-pulse z-0 transform -translate-x-1/2" />
            {roadmapSteps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? "" : "md:flex-row-reverse"} items-center justify-between gap-10 mb-24 z-10`}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
                  <div className="w-6 h-6 bg-red-600 rounded-full shadow-[0_0_20px_#ff1a1a]" />
                  <div className="w-1 h-full bg-gradient-to-b from-red-600 to-transparent animate-pulse" />
                </div>
                <div className="bg-[#111] border border-red-900 rounded-2xl p-6 md:max-w-lg w-full shadow-[0_0_30px_rgba(255,26,26,0.2)] z-20">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-md">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

{/* FINAL CTA SECTION */}
<section className="relative py-36 bg-gradient-to-b from-black via-[#110000] to-black overflow-hidden z-20">
  <motion.h2
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className="text-4xl md:text-5xl font-bold text-white text-center drop-shadow-[0_0_15px_#ff1a1a] z-10 relative"
  >
    مستعد تبدأ رحلة التغيير؟
  </motion.h2>
  <motion.p
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 0.2 }}
    className="mt-6 text-lg md:text-2xl text-center text-gray-300 max-w-3xl mx-auto z-10 relative"
  >
    انضم إلى آلاف الشباب الذين وجدوا في "تقدر" طريقهم نحو الراحة النفسية والاتزان.
  </motion.p>
  <motion.div
    className="mt-10 flex justify-center gap-6 z-10 relative"
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 0.4 }}
  >
    <button
      onClick={() => navigate("/register")}
      className="bg-gradient-to-r from-red-600 to-red-900 px-8 py-4 rounded-xl font-bold text-white shadow-[0_0_20px_#ff1a1a] hover:scale-105 transition"
    >
      ابدأ الآن
    </button>
    <button
      onClick={() => navigate("/login")}
      className="bg-gray-800 border border-red-600 px-8 py-4 rounded-xl font-bold text-white hover:bg-gray-700 hover:border-red-400 transition"
    >
      تسجيل الدخول
    </button>
  </motion.div>
</section>

        {/* BUBBLE CHAT */}
        <div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 flex items-center gap-3 bg-[#111] border border-red-700 rounded-full px-4 py-2 shadow-[0_0_25px_#ff1a1a] hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/register")}
          style={{ width: "auto", minWidth: "320px", height: "64px" }}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <BubbleBot style={{ width: "100%", height: "100%" }} />
          </div>
          <TypingText text="مرحبًا 👋، كيف تشعر اليوم؟ أنا هنا لأساعدك!" speed={50} />
        </div>
      </div>
    </>
  );
}

export default LandingPage;