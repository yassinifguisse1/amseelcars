"use client";

import React, { useState, useCallback } from "react";
import { CheckCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./contact.module.css";

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

  const validateForm = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!formData.name.trim()) next.name = t("errNameRequired");
    if (!formData.email.trim()) next.email = t("errEmailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = t("errEmailInvalid");
    if (!formData.message.trim()) next.message = t("errMessageRequired");
    else if (formData.message.trim().length < 10) next.message = t("errMessageMin");
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [formData, t]);

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
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to send message");

      setIsSubmitted(true);
      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", message: "" });
        setIsSubmitted(false);
      }, 3200);
    } catch {
      setErrors({ message: t("errSendFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      className={styles.form}
      noValidate
    >
      <div className={styles.field}>
        <label htmlFor="name" className={styles.fieldLabel}>
          {t("nameLabel")} *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`${styles.fieldInput} ${errors.name ? styles.fieldInputInvalid : ""}`}
          placeholder={t("namePlaceholder")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          autoComplete="name"
        />
        {errors.name ? (
          <p id="name-error" className={styles.fieldError} role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.fieldLabel}>
          {t("emailLabel")} *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`${styles.fieldInput} ${errors.email ? styles.fieldInputInvalid : ""}`}
          placeholder={t("emailPlaceholder")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          autoComplete="email"
        />
        {errors.email ? (
          <p id="email-error" className={styles.fieldError} role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="phone" className={styles.fieldLabel}>
          {t("phoneLabel")}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={styles.fieldInput}
          placeholder={t("phonePlaceholder")}
          autoComplete="tel"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.fieldLabel}>
          {t("messageLabel")} *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className={`${styles.fieldTextarea} ${errors.message ? styles.fieldTextareaInvalid : ""}`}
          placeholder={t("messagePlaceholder")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message ? (
          <p id="message-error" className={styles.fieldError} role="alert">
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isSubmitted}
        className={`${styles.submitBtn} ${isSubmitted ? styles.submitSuccess : ""}`}
      >
        {isSubmitting ? (
          <>
            <span className={styles.spinner} aria-hidden />
            <span>{t("submitting")}</span>
          </>
        ) : isSubmitted ? (
          <>
            <CheckCircle size={18} strokeWidth={1.5} aria-hidden />
            <span>{t("sent")}</span>
          </>
        ) : (
          <>
            <Send size={18} strokeWidth={1.5} aria-hidden />
            <span>{t("submit")}</span>
          </>
        )}
      </button>

      {isSubmitted ? (
        <p className={styles.successNote} id="submit-status">
          {t("successNote")}
        </p>
      ) : null}
    </form>
  );
}
