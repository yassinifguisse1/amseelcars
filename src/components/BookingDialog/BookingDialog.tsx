"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './BookingDialog.module.css';

// Form validation schema
const bookingSchema = z.object({
  fullName: z.string().min(2, 'Nom complet doit être au moins de 2 caractères'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  phone: z.string().min(10, 'Numéro de téléphone doit être au moins de 10 chiffres'),
  pickupDate: z.string().min(1, 'Veuillez sélectionner une date de récupération'),
  returnDate: z.string().min(1, 'Veuillez sélectionner une date de retour'),
  pickupLocation: z.string().min(1, 'Veuillez sélectionner le lieu de récupération'),
  returnLocation: z.string().min(1, 'Veuillez sélectionner le lieu de retour'),
}).refine((data) => {
  const pickup = new Date(data.pickupDate);
  const returnDate = new Date(data.returnDate);
  return returnDate > pickup;
}, {
  message: "Date de retour doit être après la date de récupération",
  path: ["returnDate"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Location options
const locationOptions = [
  { value: '', label: 'Sélectionnez un lieu' },
  { value: 'agadir-centre', label: 'Agadir Centre' },
  { value: 'aeroport-al-massira', label: 'Aéroport Al Massira' },
  { value: 'taghazout', label: 'Taghazout' },
  { value: 'agence', label: 'Agence' }
];

interface BookingDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  carName: string;
  carPrice: number;
  /** Optional tiered pricing: shortTerm (1–4 days), longTerm (5+ days). When set, total uses longTerm for 5+ days. */
  pricing?: {
    shortTerm: number;
    longTerm: number;
    hasDiscount: boolean;
  };
  /** When true, render the form inline on the page instead of in a modal */
  inline?: boolean;
  /** Optional content rendered below the submit button when inline (e.g. WhatsApp button) */
  extraActions?: React.ReactNode;
}

/**
 * Render a booking dialog or inline reservation form for a car and handle user input, validation, pricing calculation, and submission.
 *
 * The component validates form fields, computes rental days and total price (uses `pricing.longTerm` when `pricing?.hasDiscount` is true and rental is 5 or more days, otherwise uses `pricing.shortTerm` or `carPrice`), and POSTs the booking payload to `/api/booking`. On successful submission the form is reset and the component either auto-closes (modal mode) or clears its success state after a delay (inline mode). While submitting, the UI shows a loading state and prevents the dialog from closing.
 *
 * @param isOpen - If false, the modal dialog is not rendered; defaults to `true`.
 * @param onClose - Callback invoked when the dialog is closed.
 * @param carName - Display name of the car being booked.
 * @param carPrice - Base price per day used as a fallback when `pricing` is not provided.
 * @param pricing - Optional tiered pricing object. If `hasDiscount` is true and the rental duration is 5 or more days, `longTerm` is used as the per-day rate; otherwise `shortTerm` is used when available.
 * @param inline - When true, render a compact inline reservation card instead of a modal; defaults to `false`.
 * @param extraActions - Optional React node rendered below the submit controls in inline mode.
 * @returns The dialog or inline reservation form as a React element.
 */
export default function BookingDialog({ 
  isOpen = true, 
  onClose = () => {}, 
  carName, 
  carPrice,
  pricing,
  inline = false,
  extraActions,
}: BookingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const watchedPickupDate = watch('pickupDate');
  const watchedReturnDate = watch('returnDate');

  // Prevent body scroll when dialog is open and handle mobile viewport
  // useScrollLock(isOpen);
  // Calculate rental duration and total price (use 5+ days rate when pricing.hasDiscount and days >= 5)
  const calculateRentalDetails = () => {
    if (!watchedPickupDate || !watchedReturnDate) return { days: 0, total: 0 };
    
    const pickup = new Date(watchedPickupDate);
    const returnDate = new Date(watchedReturnDate);
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const pricePerDay =
      pricing?.hasDiscount && days >= 5
        ? pricing.longTerm
        : (pricing?.shortTerm ?? carPrice);
    const total = days * pricePerDay;
    
    return { days, total };
  };

  const { days, total } = calculateRentalDetails();

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          carName,
          carPrice,
          rentalDays: days,
          totalPrice: total,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
        // Auto close after 3 seconds only when in modal mode
        if (!inline) {
          setTimeout(() => {
            onClose?.();
            setSubmitStatus('idle');
          }, 3000);
        } else {
          setTimeout(() => setSubmitStatus('idle'), 5000);
        }
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose?.();
      setSubmitStatus('idle');
      reset();
    }
  };

  // Non-passive wheel listener so preventDefault() works when at scroll bounds (React's onWheel is passive)
  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

  const formContent = (
    <>
                {submitStatus === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Réservation confirmée!</h3>
                    <p className="text-gray-600">Nous avons reçu votre demande de réservation et nous vous contacterons sous peu.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                    {/* Rental Dates - first */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Dates de location
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de récupération *
                          </label>
                          <input
                            {...register('pickupDate')}
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {errors.pickupDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.pickupDate.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de retour *
                          </label>
                          <input
                            {...register('returnDate')}
                            type="date"
                            min={watchedPickupDate || new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {errors.returnDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.returnDate.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Locations - second */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Lieux de récupération et de retour
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lieu de récupération *
                          </label>
                          <select
                            {...register('pickupLocation')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            {locationOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.pickupLocation && (
                            <p className="text-red-500 text-sm mt-1">{errors.pickupLocation.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lieu de retour *
                          </label>
                          <select
                            {...register('returnLocation')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            {locationOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.returnLocation && (
                            <p className="text-red-500 text-sm mt-1">{errors.returnLocation.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal Information - third */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informations personnelles
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom complet *
                          </label>
                          <input
                            {...register('fullName')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Entrez votre nom complet"
                          />
                          {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse email *
                          </label>
                          <input
                            {...register('email')}
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="votre@email.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro de téléphone *
                          </label>
                          <input
                            {...register('phone')}
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+212 6XX XXX XXX"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Rental Summary */}
                    {/* {days > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé de la location</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Durée de la location:</span>
                            <span className="font-medium">{days} day{days > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Prix par jour:</span>
                            <span className="font-medium">MAD {carPrice}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold border-t pt-2">
                            <span>Prix total:</span>
                            <span className="text-blue-600">MAD {total}</span>
                          </div>
                        </div>
                      </div>
                    )} */}

                    {/* Error Message */}
                    {submitStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">
                          Il y a eu une erreur lors de la réservation. Veuillez réessayer ou contactez-nous directement.
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-1 pt-4">
                      {!inline && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          Annuler
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={inline ? "w-full bg-[#EC1C25] hover:bg-[#EC1C25]/90 text-white rounded-[25px] h-10 uppercase font-medium" : "flex-1 bg-blue-600 hover:bg-blue-700"}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Envoi...
                          </div>
                        ) : (
                          'Envoyer la réservation'
                        )}
                      </Button>
                    </div>
                    {inline && extraActions && (
                      <div className="pt-0">
                        {extraActions}
                      </div>
                    )}
                  </form>
                )}
    </>
  );

  if (inline) {
    return (
      <motion.div
        id="reservation-form"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={styles.inlineFormWrapper}
      >
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/25 bg-card shadow-xl ring-2 ring-primary/10">
          {/* Accent corner badge */}
          <div className="absolute top-0 right-0 z-10 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-bl-xl shadow-md">
            Réservation
          </div>
          <div className="bg-[#EC1C25] p-5 md:p-7 text-white relative">
            <div className="pr-24">
              <h2 className="text-xl md:text-2xl font-bold drop-shadow-sm">Réservez cette voiture</h2>
              <p className="text-white/95 text-sm md:text-base mt-0.5">{carName}</p>
            </div>
          </div>
          <div className={`p-5 md:p-7 ${styles.inlineFormBody}`}>
            {formContent}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`fixed  inset-0 z-50 flex items-center justify-center mt-10 md:mt-3  md:pt-0 p-4 md:p-8 ${styles.dialogContainer}`}
            onWheel={(e) => e.stopPropagation()}
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
            }}
          >
            {/* Mobile-optimized dialog container */}
            <div 
              className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden  ${styles.dialogWrapper}`}
              data-dialog="booking"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-[#CB1939] to-[#CB1939]/80 p-6 text-white">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Réservez votre voiture</h2>
                    <p className="text-blue-100">{carName}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                ref={contentRef}
                className={`p-6 overflow-y-auto ${styles.dialogContent}`}
              >
                {formContent}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
