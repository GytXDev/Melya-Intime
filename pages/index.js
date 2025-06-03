import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import PaymentModal from "../components/PaymentModal";

export default function MelyaProfile() {
  const [hasPaid, setHasPaid] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(null); // <- Montant sélectionné
  const videoRef = useRef(null);

  useEffect(() => {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    return () => document.removeEventListener("contextmenu", (e) => e.preventDefault());
  }, []);

  useEffect(() => {
    const paid = localStorage.getItem("hasPaidMelya");
    if (paid === "true") {
      setHasPaid(true);
    }
  }, []);

  const handlePaymentSuccess = () => {
    localStorage.setItem("hasPaidMelya", "true");
    setHasPaid(true);
    setSelectedAmount(null); // Fermer la modale
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <>
      <Head>
        <title>Juste moi</title>
        <meta name="description" content="Contenu privé réservé aux membres." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-6 font-sans">
        {/* Profil */}
        <div className="text-center mt-4">
          {selectedAmount !== null && (
            <PaymentModal
              amount={selectedAmount}
              onClose={() => setSelectedAmount(null)}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </div>

        {/* Vidéo */}
        <div className="relative mt-8 w-full max-w-md rounded-xl overflow-hidden shadow-xl">
          <video
            ref={videoRef}
            src="/video.mp4"
            className={`w-full h-auto object-cover transition duration-500 ${!hasPaid ? 'blur-md pointer-events-none' : ''}`}
            playsInline
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
          {!hasPaid && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-xl px-4">
              <p className="text-center mb-4 text-sm italic">
                Tu choisis combien tu veux me voir...<br />
                Et si j’étais bien plus cochonne que ce que tu imagines ? 🙈
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={() => setSelectedAmount(2000)}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
                >
                  2000 CFA 🥵
                </button>
                <button
                  onClick={() => setSelectedAmount(3000)}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
                >
                  3000 CFA 🔥
                </button>
                <button
                  onClick={() => setSelectedAmount(5000)}
                  className="w-full bg-pink-700 hover:bg-pink-800 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
                >
                  5000 CFA 🍑🍆
                </button>
              </div>
            </div>
          )}

          {/* Bouton Play */}
          {hasPaid && !isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
            >
              <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}

          {/* Mute */}
          {hasPaid && (
            <button
              onClick={toggleMute}
              className="absolute bottom-14 right-3 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 shadow-md"
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 9L5 13h-2v-2h2l4-4v6l4 4V5l-4 4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 9L5 13h-2v-2h2l4-4v6l4 4V5l-4 4zm10 0l2 2m0-2l-2 2" />
                </svg>
              )}
            </button>
          )}

          {/* Barre de lecture */}
          {hasPaid && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-2 text-sm text-white">
              <div className="flex justify-between mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div
                className="w-full h-2 bg-gray-600 rounded cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="h-2 bg-pink-500 rounded"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        {/* {hasPaid && (
          <div className="mt-6 text-center">
            <p className="text-lg italic text-pink-500 mb-3">Tu veux aller plus loin ?</p>
            <div className="flex flex-col items-center gap-2">
              <a
                href="https://www.instagram.com/melyandong/"
                target="_blank"
                className="flex flex-col items-center text-pink-600"
              >
                <div className="flex items-center gap-2">
                  <img src="/instagram.png" alt="Instagram" className="w-5 h-5" />
                  @melya_ndong
                </div>
                <span className="text-sm italic text-gray-500 mt-1">
                  Rejoins-moi sur Insta… certaines choses ne se montrent qu’en privé 💋
                </span>
              </a>
            </div>
          </div>
        )} */}

        {/* Bouton de réinitialisation (facultatif) */}
        {/* <button
          onClick={() => {
            localStorage.removeItem("hasPaidMelya");
            setHasPaid(false);
            window.location.reload();
          }}
          className="mt-6 text-xs text-gray-400 hover:underline"
        >
          Réinitialiser (dev)
        </button> */}
      </div>
    </>
  );
}
