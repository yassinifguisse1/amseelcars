"use client";

import React, { useState } from 'react';
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

// put this above your component (in the same file)
// function useScrollLock(isOpen: boolean) {
//   // holds the scrollY we freeze at
//   const savedY = React.useRef(0);

//   useEffect(() => {
//     const html = document.documentElement;
//     const body = document.body;

//     const lock = () => {
//       savedY.current = window.scrollY || window.pageYOffset || 0;

//       // Make the root non-scrollable and freeze at current Y
//       html.style.position = 'fixed';
//       html.style.top = `-${savedY.current}px`;
//       html.style.width = '100%';
//       html.style.overflow = 'hidden';

//       // Body too (prevents rubber-band on iOS)
//       body.style.overflow = 'hidden';
//       body.style.width = '100%';
//       body.style.touchAction = 'none';
//     };

//     const unlock = () => {
//       const y = savedY.current;

//       // Clear styles in reverse order
//       body.style.overflow = '';
//       body.style.width = '';
//       body.style.touchAction = '';

//       html.style.position = '';
//       html.style.top = '';
//       html.style.width = '';
//       html.style.overflow = '';

//       // Restore scroll position (very important on iOS)
//       window.scrollTo(0, y);
//     };

//     // Extra safety: if the tab is hidden/shown or orientation changes, ensure unlock runs
//     const safeUnlock = () => {
//       if (!isOpen) unlock();
//     };

//     if (isOpen) {
//       lock();
//       // listeners that may fire while dialog is open
//       window.addEventListener('orientationchange', safeUnlock, { passive: true });
//       document.addEventListener('visibilitychange', safeUnlock, { passive: true });
//     } else {
//       unlock();
//     }

//     return () => {
//       // cleanup unlock (covers fast close/unmount)
//       unlock();
//       window.removeEventListener('orientationchange', safeUnlock);
//       document.removeEventListener('visibilitychange', safeUnlock);
//     };
//   }, [isOpen]);
// }


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
  isOpen: boolean;
  onClose: () => void;
  carName: string;
  carPrice: number;
  carImage: string;
}

export default function BookingDialog({ 
  isOpen, 
  onClose, 
  carName, 
  carPrice 
}: Omit<BookingDialogProps, 'carImage'>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
  // Calculate rental duration and total price
  const calculateRentalDetails = () => {
    if (!watchedPickupDate || !watchedReturnDate) return { days: 0, total: 0 };
    
    const pickup = new Date(watchedPickupDate);
    const returnDate = new Date(watchedReturnDate);
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const total = days * carPrice;
    
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
        // Auto close after 3 seconds
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 3000);
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
      onClose();
      setSubmitStatus('idle');
      reset();
    }
  };

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
                className={`p-6 overflow-y-auto ${styles.dialogContent}`}
                onWheel={(e) => {
                  e.stopPropagation();
                  const element = e.currentTarget;
                  const { scrollTop, scrollHeight, clientHeight } = element;
                  
                  // Check if we're at the top or bottom
                  const isAtTop = scrollTop === 0;
                  const isAtBottom = scrollTop + clientHeight >= scrollHeight;
                  
                  // If scrolling up and at top, or scrolling down and at bottom, prevent default
                  if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
                    e.preventDefault();
                  }
                }}
              >
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
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
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

                    {/* Rental Dates */}
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

                    {/* Locations */}
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
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
