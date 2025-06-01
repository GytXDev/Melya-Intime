// components/Toast.js
export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.textContent = message;

  const bgColor = {
    success: "bg-green-600",
    error: "bg-pink-600",
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

// animations
const style = document.createElement("style");
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