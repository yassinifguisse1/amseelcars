"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, Phone, User, MessageSquare, Send, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ACCENT = "#EC1C25";

export default function ContactForm() {
  const t = useTranslations("contactPage.form");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const fieldsRef = useRef<HTMLDivElement[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const addFieldRef = (el: HTMLDivElement | null) => {
    if (el && !fieldsRef.current.includes(el)) {
      fieldsRef.current.push(el);
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = t("errNameRequired");
    if (!formData.email.trim()) newErrors.email = t("errEmailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = t("errEmailInvalid");
    if (!formData.message.trim()) newErrors.message = t("errMessageRequired");
    else if (formData.message.trim().length < 10)
      newErrors.message = t("errMessageMin");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  useEffect(() => {
    const form = formRef.current;
    const fields = fieldsRef.current;
    const button = buttonRef.current;
    if (!form || !fields.length || !button) return;

    gsap.set([...fields, button], { opacity: 0, y: 28, scale: 0.97 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: form,
        start: "top 82%",
        end: "bottom 12%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(fields, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.75,
      stagger: 0.09,
      ease: "power3.out",
    }).to(
      button,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: "back.out(1.5)",
      },
      "-=0.25",
    );

    fields.forEach((field) => {
      const input = field.querySelector("input, textarea");
      if (!input) return;
      const onFocus = () => {
        gsap.to(field, { scale: 1.015, duration: 0.25, ease: "power2.out" });
        const icon = field.querySelector(".field-icon");
        if (icon)
          gsap.to(icon, {
            scale: 1.08,
            color: ACCENT,
            duration: 0.25,
          });
      };
      const onBlur = () => {
        gsap.to(field, { scale: 1, duration: 0.25, ease: "power2.out" });
        const icon = field.querySelector(".field-icon");
        if (icon)
          gsap.to(icon, {
            scale: 1,
            color: "#9ca3af",
            duration: 0.25,
          });
      };
      input.addEventListener("focus", onFocus);
      input.addEventListener("blur", onBlur);
    });

    return () => {
      ScrollTrigger.getAll().forEach((tr) => tr.kill());
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      gsap.to(formRef.current, {
        keyframes: { x: [-8, 8, -8, 8, 0] },
        duration: 0.45,
        ease: "power2.inOut",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to send message");

      setIsSubmitted(true);
      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          scale: 1.06,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        });
      }
      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", message: "" });
        setIsSubmitted(false);
      }, 3200);
    } catch {
      setErrors({ message: t("errSendFailed") });
      gsap.to(formRef.current, {
        keyframes: { x: [-8, 8, -8, 8, 0] },
        duration: 0.45,
        ease: "power2.inOut",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ring =
    "focus:outline-none focus:ring-2 focus:ring-[#EC1C25]/60 focus:border-transparent";

  return (
    <div className="mx-auto w-full max-w-xl">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_32px_64px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-10"
        noValidate
      >
        <div className="mb-2 text-center">
          <h2 className="font-[family-name:var(--font-heading)] mb-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-base leading-relaxed text-neutral-400">
            {t("intro")}
          </p>
        </div>

        <div ref={addFieldRef} className="relative">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-neutral-300"
          >
            {t("nameLabel")} *
          </label>
          <div className="relative">
            <User className="field-icon pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-xl border bg-black/30 py-4 pl-12 pr-4 text-white placeholder:text-neutral-500 ${ring} ${
                errors.name ? "border-red-500/80" : "border-white/15"
              }`}
              placeholder={t("namePlaceholder")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </div>
          {errors.name && (
            <p id="name-error" className="mt-2 text-sm text-red-400/90" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div ref={addFieldRef} className="relative">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-neutral-300"
          >
            {t("emailLabel")} *
          </label>
          <div className="relative">
            <Mail className="field-icon pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-xl border bg-black/30 py-4 pl-12 pr-4 text-white placeholder:text-neutral-500 ${ring} ${
                errors.email ? "border-red-500/80" : "border-white/15"
              }`}
              placeholder={t("emailPlaceholder")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-400/90" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div ref={addFieldRef} className="relative">
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-neutral-300"
          >
            {t("phoneLabel")}
          </label>
          <div className="relative">
            <Phone className="field-icon pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full rounded-xl border border-white/15 bg-black/30 py-4 pl-12 pr-4 text-white placeholder:text-neutral-500 ${ring}`}
              placeholder={t("phonePlaceholder")}
            />
          </div>
        </div>

        <div ref={addFieldRef} className="relative">
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-neutral-300"
          >
            {t("messageLabel")} *
          </label>
          <div className="relative">
            <MessageSquare className="field-icon pointer-events-none absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={`w-full resize-none rounded-xl border bg-black/30 py-4 pl-12 pr-4 text-white placeholder:text-neutral-500 ${ring} ${
                errors.message ? "border-red-500/80" : "border-white/15"
              }`}
              placeholder={t("messagePlaceholder")}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
            />
          </div>
          {errors.message && (
            <p id="message-error" className="mt-2 text-sm text-red-400/90" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <button
          ref={buttonRef}
          type="submit"
          disabled={isSubmitting || isSubmitted}
          className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 text-lg font-semibold transition-all duration-300 ${
            isSubmitted
              ? "bg-emerald-600 text-white"
              : "bg-gradient-to-r from-[#EC1C25] to-[#c41520] text-white shadow-lg shadow-[#EC1C25]/20 hover:shadow-xl hover:shadow-[#EC1C25]/25"
          } ${isSubmitting ? "cursor-not-allowed opacity-75" : ""}`}
        >
          {isSubmitting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>{t("submitting")}</span>
            </>
          ) : isSubmitted ? (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>{t("sent")}</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>{t("submit")}</span>
            </>
          )}
        </button>

        {isSubmitted && (
          <p className="text-center text-sm text-emerald-400/90" id="submit-status">
            {t("successNote")}
          </p>
        )}
      </form>
    </div>
  );
}
