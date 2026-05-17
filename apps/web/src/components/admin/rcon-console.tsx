"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Send, Trash2, History } from "lucide-react";

interface CommandEntry {
  id: number;
  command: string;
  output: string;
  timestamp: Date;
  success: boolean;
}

export function RconConsole() {
  const [commands, setCommands] = useState<CommandEntry[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [executing, setExecuting] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commands]);

  const executeCommand = async () => {
    if (!input.trim() || executing) return;

    const cmd = input.trim();
    setInput("");
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setExecuting(true);

    try {
      const res = await fetch("/api/admin/rcon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();

      setCommands((prev) => [
        ...prev,
        {
          id: Date.now(),
          command: cmd,
          output: data.output || data.error || "No output",
          timestamp: new Date(),
          success: data.success,
        },
      ]);
    } catch {
      setCommands((prev) => [
        ...prev,
        {
          id: Date.now(),
          command: cmd,
          output: "Connection failed",
          timestamp: new Date(),
          success: false,
        },
      ]);
    } finally {
      setExecuting(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  return (
    <GlassCard glow="purple" className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">RCON Console</h3>
            <p className="text-[10px] text-muted-foreground">Live server terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommands([])}
            className="text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div
        ref={outputRef}
        className="h-80 overflow-y-auto p-4 space-y-2 font-mono text-xs bg-black/40"
      >
        {commands.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Type a command to start</p>
            <p className="text-[10px]">Use arrow keys for command history</p>
          </div>
        )}
        <AnimatePresence>
          {commands.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-neon-cyan">&gt;</span>
                <span className="text-white">{entry.command}</span>
              </div>
              <div
                className={`pl-4 ${
                  entry.success ? "text-green-400" : "text-red-400"
                }`}
              >
                {entry.output}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {executing && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="animate-pulse">&gt;</span>
            <span>Executing...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-4 border-t border-white/10">
        <History className="w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter server command..."
          className="font-mono text-sm"
          disabled={executing}
        />
        <Button
          onClick={executeCommand}
          disabled={!input.trim() || executing}
          size="sm"
        >
          <Send className="w-4 h-4 mr-1" />
          Send
        </Button>
      </div>
    </GlassCard>
  );
}
