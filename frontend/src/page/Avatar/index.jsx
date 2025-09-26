import { useEffect, useRef, useState } from "react";
import { useVoiceAssistant } from "./hooks/useVoice";
import { motion, AnimatePresence } from "motion/react";
import WaveFormCircle from "./hooks/WaveFormCircle";

export default function Avatar() {
  const [msg, setMsg] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    tipoProyecto: "",
    proyecto: "",
  });
  const { start, status, stop, analyzerData, muteMic, unmuteMic, isMutedRef } =
    useVoiceAssistant({
      setMsg: setMsg,
    });
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tipoProyecto || !formData.proyecto) {
      alert("Por favor selecciona todas las opciones");
      return;
    }
    console.log("Contexto enviado al avatar:", formData);
    setOpen(false);
    start();
  };

  const [open, setOpen] = useState(true);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [msg]);

  function isObjectValues(obj) {
    return Object.values(obj).every(
      (value) =>
        value !== null &&
        value !== undefined &&
        !(typeof value === "string" && value.trim() === "")
    );
  }

  useEffect(() => {
    if (!isObjectValues(formData)) {
      setOpen(true);
    }
  }, [formData]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-center 
                       bg-black/40 backdrop-blur-sm"
          >
            {/* Contenedor del modal */}
            <motion.form
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative p-4 w-full max-w-2xl rounded-lg shadow-sm bg-[#0d1b2a]"
              onSubmit={handleSubmit}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-600 text-white">
                <h3 className="text-lg font-semiboldtext-white">
                  Configura el proyecto para tu asistente
                </h3>
                {/* {isObjectValues(formData) && (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                  >
                    ✕
                  </button>
                )} */}
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                <div>
                  <label
                    for="tipoProyecto"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Tipo de proyecto
                  </label>
                  <select
                    id="tipoProyecto"
                    value={formData.tipoProyecto}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData((prev) => {
                        return { ...prev, proyecto: "" };
                      });
                    }}
                    class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option selected>Seleccionar tipo de proyecto</option>
                    <option value="web">Desarrollo Web</option>
                    <option value="mobile">Aplicación Móvil</option>
                    <option value="data">Data & Analytics</option>
                    <option value="ai">Inteligencia Artificial</option>
                  </select>
                </div>

                <div>
                  <label
                    for="proyecto"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Proyecto
                  </label>
                  <select
                    id="proyecto"
                    value={formData.proyecto}
                    onChange={handleChange}
                    class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 dark:focus:border-blue-500"
                    disabled={!formData.tipoProyecto.length > 0}
                  >
                    <option selected>Seleccionar proyecto</option>
                    <option value="landing">Landing Page</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="dashboard">Dashboard de métricas</option>
                    <option value="chatbot">Chatbot IA</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="submit"
                  // onClick={() => }
                  className="px-5 py-2.5 text-sm font-medium rounded-lg text-white 
                             bg-[#E96D19] hover:opacity-70 focus:ring-4 focus:outline-none 
                             focus:ring-[#e98f53] transition-all delay-100"
                >
                  Continuar
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#0d1b2a] flex flex-col lg:flex-row h-screen w-full p-2 overflow-hidden relative">
        <div>
          <img src="/logo.png" width={250}/>
        </div>

        <div className="flex flex-col justify-center items-center ">
          {/* Ondas */}
          <div className="flex-1 flex justify-center items-center relative">
            <div
              className={` transition-opacity duration-700 ${
                status == "Hablando" ? "opacity-0" : "opacity-100"
              }`}
            >
              {/* Silencio */}
              <div className="mic">
                <div className="mic-shadow"></div>
              </div>
            </div>
            <div
              className={` transition-opacity duration-700 ${
                status == "Hablando" ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Hablando */}
              <WaveFormCircle analyzerData={analyzerData} />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-center py-5 bottom-4 z-20 w-full items-center">
            <div className="flex flex-row gap-3 ml-auto">
              <button
                className="relative my-ellipse cursor-pointer hover:opacity-50"
                onClick={() => {
                  console.log(isMutedRef?.current);
                  if (isMutedRef?.current) {
                    unmuteMic();
                  } else {
                    muteMic();
                  }
                }}
              >
                {isMutedRef?.current && (
                  <div className="w-[3px] bg-[#E96D19] h-[40px] absolute z-10 -rotate-45"></div>
                )}
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.625 11.25C20.625 8.7636 21.6127 6.37903 23.3709 4.62087C25.129 2.86272 27.5136 1.875 30 1.875C32.4864 1.875 34.871 2.86272 36.6291 4.62087C38.3873 6.37903 39.375 8.7636 39.375 11.25V31.875C39.375 34.3614 38.3873 36.746 36.6291 38.5041C34.871 40.2623 32.4864 41.25 30 41.25C27.5136 41.25 25.129 40.2623 23.3709 38.5041C21.6127 36.746 20.625 34.3614 20.625 31.875V11.25Z"
                    fill="#e87722"
                  />
                  <path
                    d="M15 26.25C15.4973 26.25 15.9742 26.4475 16.3258 26.7992C16.6775 27.1508 16.875 27.6277 16.875 28.125V31.875C16.875 35.356 18.2578 38.6944 20.7192 41.1558C23.1806 43.6172 26.519 45 30 45C33.481 45 36.8194 43.6172 39.2808 41.1558C41.7422 38.6944 43.125 35.356 43.125 31.875V28.125C43.125 27.6277 43.3225 27.1508 43.6742 26.7992C44.0258 26.4475 44.5027 26.25 45 26.25C45.4973 26.25 45.9742 26.4475 46.3258 26.7992C46.6775 27.1508 46.875 27.6277 46.875 28.125V31.875C46.8749 36.0261 45.3451 40.0315 42.5779 43.1257C39.8107 46.2199 36.0003 48.1857 31.875 48.6475V54.375H39.375C39.8723 54.375 40.3492 54.5725 40.7008 54.9242C41.0525 55.2758 41.25 55.7527 41.25 56.25C41.25 56.7473 41.0525 57.2242 40.7008 57.5758C40.3492 57.9275 39.8723 58.125 39.375 58.125H20.625C20.1277 58.125 19.6508 57.9275 19.2992 57.5758C18.9475 57.2242 18.75 56.7473 18.75 56.25C18.75 55.7527 18.9475 55.2758 19.2992 54.9242C19.6508 54.5725 20.1277 54.375 20.625 54.375H28.125V48.6475C23.9997 48.1857 20.1893 46.2199 17.4221 43.1257C14.6549 40.0315 13.1251 36.0261 13.125 31.875V28.125C13.125 27.6277 13.3225 27.1508 13.6742 26.7992C14.0258 26.4475 14.5027 26.25 15 26.25Z"
                    fill="#e87722"
                  />
                </svg>{" "}
              </button>
              <button
                className={`relative rounded-full bg-red-500 cursor-pointer hover:opacity-50 ml-auto w-[70px] h-[70px] grid place-content-center`}
                onClick={() => {
                  stop();
                  setFormData({ proyecto: "", tipoProyecto: "" });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="size-10"
                >
                  <path
                    fillRule="evenodd"
                    d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <button
              className={`flex ml-auto p-2 rounded-lg mr-3 cursor-pointer ${
                isOpen ? "bg-[#E96D19]" : ""
              }`}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isOpen ? "#fff" : "#E96D19"}
                className="size-10"
              >
                <path
                  fillRule="evenodd"
                  d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                  clipRule="evenodd"
                />
                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
              </svg>
            </button>
          </div>
        </div>
        <div
          className={`flex flex-col gap-4 h-full bg-[#0e243b] p-2 px-4 rounded-xl relative shadow 
  ${isOpen ? "w-full lg:w-4/12 opacity-100" : "opacity-0 w-0"} 
  transition-all duration-500 ease-in-out`}
        >
          <h1
            className={`font-bold text-xl text-white ${
              isOpen ? "opacity-100" : "opacity-0"
            } transition-all duration-100 ease-in-out`}
          >
            Transcripción
          </h1>

          <div
            className={`flex-1 max-h-full overflow-y-auto flex flex-col gap-4 ${
              isOpen ? "opacity-100" : "opacity-0"
            } transition-all duration-100 ease-in-out`}
            ref={chatContainerRef}
          >
            {msg.map((m, i) => (
              <AnimatePresence mode="wait" key={i}>
                <motion.span
                  className={`px-3 py-2 rounded-xl max-w-10/12 text-sm shadow-sm transition-colors
        ${
          m.role === "assistant"
            ? "bg-[#f1f5f9] text-[#1e1e1e] self-start"
            : "bg-gradient-to-r from-[#E96D19] to-[#E96D19] text-white self-end"
        }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {m.value}
                </motion.span>
              </AnimatePresence>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
