import { useState, useEffect } from "react";

// Toast stylé
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.textContent = message;

    const bgColor = {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-gray-800",
    }[type];

    toast.className = `
    fixed bottom-6 left-1/2 -translate-x-1/2 z-50 
    px-5 py-3 rounded-md text-white text-sm shadow-lg
    ${bgColor} animate-slidein
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("animate-slideout");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Confettis animés 🎉
function triggerConfetti() {
    const canvas = document.createElement("canvas");
    canvas.id = "confetti";
    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = 1000;
    document.body.appendChild(canvas);

    import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti.create(canvas, { resize: true })({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 },
        });
        setTimeout(() => {
            canvas.remove();
        }, 2000);
    });
}

// Injecter les animations
if (typeof window !== "undefined" && !document.getElementById("toast-animation-style")) {
    const style = document.createElement("style");
    style.id = "toast-animation-style";
    style.textContent = `
    @keyframes slidein {
      from { transform: translate(-50%, 30px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideout {
      from { transform: translate(-50%, 0); opacity: 1; }
      to { transform: translate(-50%, 30px); opacity: 0; }
    }
    .animate-slidein {
      animation: slidein 0.4s ease-out forwards;
    }
    .animate-slideout {
      animation: slideout 0.3s ease-in forwards;
    }
  `;
    document.head.appendChild(style);
}

export default function PaymentModal({ amount = 2000, onClose, onSuccess }) {
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isValidGabonPhone = (num) => {
        const cleaned = num.replace(/\D/g, "");
        return /^0(74|77)\d{6}$/.test(cleaned);
    };

    const handlePay = async () => {
        const cleanedPhone = phone.replace(/\D/g, "");

        if (!cleanedPhone) {
            return showToast("Entre ton numéro d’abord.", "error");
        }

        if (!isValidGabonPhone(cleanedPhone)) {
            return showToast("Numéro invalide. Commence par 074 ou 077. Le numéro doit contenir exactement 9 chiffres.", "error");
        }

        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append("numero", cleanedPhone);
            formData.append("amount", amount.toString());

            const response = await fetch("https://gytx.dev/api/airtelmoney-web.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });

            const result = await response.json();

            if (/success|successfully processed/i.test(result.status_message)) {
                showToast(`Merci pour les ${amount} CFA 😘`, "success");
                triggerConfetti();
                onSuccess();
            } else {
                showToast(result.status_message || "Échec du paiement", "error");
            }
        } catch (error) {
            showToast("Erreur réseau. Réessaie.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 text-center relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    ✖
                </button>

                <p className="text-gray-700 mb-4 italic">
                    Tu veux me voir vraiment ? Approche...
                </p>

                <input
                    type="tel"
                    placeholder="Ex: 077123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500 text-center"
                />

                <button
                    onClick={handlePay}
                    disabled={isLoading}
                    className={`w-full ${isLoading ? "bg-pink-300" : "bg-pink-600 hover:bg-pink-700"
                        } text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2`}
                >
                    {isLoading ? (
                        <span className="loader"></span>
                    ) : (
                        `Débloquer pour ${amount} CFA`
                    )}
                </button>
            </div>

            {/* Loader animation */}
            <style jsx>{`
        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #fff;
          border-right: 3px solid #fff;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}