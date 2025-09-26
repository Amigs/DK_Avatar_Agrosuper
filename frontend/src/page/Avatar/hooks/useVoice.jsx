import { useState, useRef, useCallback, useEffect } from "react";

export function useVoiceAssistant({ setMsg }) {
  const [status, setStatus] = useState("idle");
  const [analyzerData, setAnalyzerData] = useState(null);

  const isMutedRef = useRef(false); // 👈 ahora ref en lugar de state
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const wsRef = useRef(null);
  const queueTimeRef = useRef(undefined);
  const assistantSourcesRef = useRef([]);
  const partialBufRef = useRef("");
  const [isStart, setIsStart] = useState(false);

  const int16ToFloat32 = (int16) => {
    const f32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      const int = int16[i];
      f32[i] = int < 0 ? int / 0x8000 : int / 0x7fff;
    }
    return f32;
  };

  const muteMic = () => {
    isMutedRef.current = true;
  };

  const unmuteMic = () => {
    isMutedRef.current = false;
  };

  const playChunk = async (base64) => {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const int16 = new Int16Array(bytes.buffer);
    const f32 = int16ToFloat32(int16);

    const ctx =
      audioCtxRef.current ||
      (audioCtxRef.current = new AudioContext({ sampleRate: 24000 }));

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 2048;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setAnalyzerData({
        analyzer: analyserRef.current,
        bufferLength,
        dataArray,
      });
    }

    const buf = ctx.createBuffer(1, f32.length, 24000);
    buf.copyToChannel(f32, 0);

    const src = ctx.createBufferSource();
    src.buffer = buf;

    src.connect(analyserRef.current);
    analyserRef.current.connect(ctx.destination);

    const startAt = Math.max(
      queueTimeRef.current ?? ctx.currentTime,
      ctx.currentTime + 0.05
    );
    src.start(startAt);
    queueTimeRef.current = startAt + buf.duration;

    assistantSourcesRef.current.push(src);
    src.onended = () => {
      assistantSourcesRef.current = assistantSourcesRef.current.filter(
        (s) => s !== src
      );
    };
  };

  const start = useCallback(async () => {
    if (status !== "idle") return;

    setStatus("Conectando");

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    }
    await audioCtxRef.current.audioWorklet.addModule("/recorder-worklet.js");

    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const source = audioCtxRef.current.createMediaStreamSource(
      mediaStreamRef.current
    );
    const node = new AudioWorkletNode(
      audioCtxRef.current,
      "recorder-processor"
    );
    source.connect(node);
    node.connect(audioCtxRef.current.destination);

    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    // wsRef.current = new WebSocket(`${proto}//${location.host}/realtime`);
    wsRef.current = new WebSocket(`${proto}//localhost:8000/realtime`);

    wsRef.current.onopen = async () => {
      wsRef.current?.send(
        JSON.stringify({ type: "session.update", session: {} })
      );
      await playWelcomeAudio();
    };

    wsRef.current.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      switch (m.type) {
        case "assistant.audio":
          setStatus("Hablando");
          playChunk(m.audio);
          break;
        case "transcript.delta":
          partialBufRef.current += m.text;
          break;
        case "transcript.final":
          partialBufRef.current = "";
          if (m.role === "assistant") setStatus("Hablando");
          if (m.role === "assistant" || (m.role === "user" && m.text)) {
            setMsg((prev) => [...prev, { role: m.role, value: m.text }]);
          }
          break;
        case "speech_started":
          setStatus("Escuchando");
          stopAssistantAudio();
          break;
      }
    };

    wsRef.current.onclose = () => {
      stop();
    };

    node.port.onmessage = (ev) => {
      if (isMutedRef.current) return; // 👈 siempre lee valor actual
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      const int16 = new Int16Array(ev.data);
      const bytes = new Uint8Array(int16.buffer);
      let bin = "";
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      const base64 = btoa(bin);
      wsRef.current.send(
        JSON.stringify({ type: "input_audio_buffer.append", audio: base64 })
      );
    };
  }, [status, setMsg]);

  const stopAssistantAudio = () => {
    assistantSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    assistantSourcesRef.current = [];
    if (audioCtxRef.current) {
      queueTimeRef.current = audioCtxRef.current.currentTime;
    }
  };

  const stop = useCallback(() => {
    if (status === "idle") return;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopAssistantAudio();
    partialBufRef.current = "";
    queueTimeRef.current = undefined;
    assistantSourcesRef.current = [];
    setStatus("idle");
  }, [status]);

  async function playWelcomeAudio() {
    return new Promise((resolve) => {
      const welcome = new Audio("/bienvenida.wav");
      setMsg((prev) => [
        ...prev,
        { role: "assistant", value: "Hola. ¿En qué puedo ayudarte hoy?" },
      ]);
      setStatus("Hablando");
      welcome.play();
      welcome.onended = () => resolve();
    });
  }

  useEffect(() => {
    return () => {
      stop();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isStart) {
      console.log(isStart);
    }
  }, [isStart]);
  return {
    start,
    stop,
    status,
    analyzerData,
    setAnalyzerData,
    mediaStreamRef,
    muteMic,
    unmuteMic,
    isMutedRef, // 👈 por si lo necesitas fuera
  };
}
