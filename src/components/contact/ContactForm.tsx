"use client";

import { useState } from "react";

interface ContactFormProps {
  darkMode?: boolean;
}

export default function ContactForm({ darkMode = false }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <div className={`border rounded-xl p-6 text-center ${darkMode ? "bg-teal/20 border-teal/30" : "bg-teal/10 border-teal/20"}`}>
        <h2 className="font-headline text-xl uppercase tracking-tight text-teal mb-2">
          Message Sent!
        </h2>
        <p className={darkMode ? "text-white/70" : "text-dark/70"}>Thanks for reaching out. We'll get back to you soon.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-teal font-medium hover:text-teal/80 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputClasses = darkMode
    ? "block w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-colors"
    : "block w-full rounded-lg border border-dark/20 bg-white px-4 py-3 text-dark placeholder:text-dark/40 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-colors";

  const labelClasses = darkMode
    ? "block font-headline text-sm uppercase tracking-wide text-white/70 mb-2"
    : "block font-headline text-sm uppercase tracking-wide text-dark mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "error" && (
        <div className="bg-pink/10 border border-pink/20 rounded-xl p-4 text-pink">
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClasses}>
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClasses}
          disabled={status === "loading"}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClasses}>
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputClasses}
          disabled={status === "loading"}
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClasses}>
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`${inputClasses} resize-none`}
          disabled={status === "loading"}
          placeholder="Your message..."
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className={`w-full py-3 px-4 rounded-lg font-headline uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          darkMode
            ? "bg-teal text-dark hover:bg-teal/90"
            : "bg-dark text-white hover:bg-dark/90"
        }`}
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
