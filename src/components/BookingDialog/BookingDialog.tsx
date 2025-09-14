"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, MapPin, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './BookingDialog.module.css';

// Form validation schema
const bookingSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  pickupDate: z.string().min(1, 'Please select a pickup date'),
  returnDate: z.string().min(1, 'Please select a return date'),
  pickupLocation: z.string().min(2, 'Please enter pickup location'),
  returnLocation: z.string().min(2, 'Please enter return location'),
  driverAge: z.string().min(1, 'Please enter driver age'),
  specialRequests: z.string().optional(),
}).refine((data) => {
  const pickup = new Date(data.pickupDate);
  const returnDate = new Date(data.returnDate);
  return returnDate > pickup;
}, {
  message: "Return date must be after pickup date",
  path: ["returnDate"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

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
  carPrice, 
  carImage 
}: BookingDialogProps) {
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

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${styles.dialogContainer}`}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
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
                    <h2 className="text-2xl font-bold">Book Your Car</h2>
                    <p className="text-blue-100">{carName}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div 
                className={`p-6 overflow-y-auto max-h-[calc(90vh-120px)] ${styles.dialogContent}`}
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-600">We&apos;ve received your booking request and will contact you shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            {...register('fullName')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                          {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            {...register('email')}
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="your@email.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Driver Age *
                          </label>
                          <input
                            {...register('driverAge')}
                            type="number"
                            min="18"
                            max="80"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="18"
                          />
                          {errors.driverAge && (
                            <p className="text-red-500 text-sm mt-1">{errors.driverAge.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rental Dates */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Rental Dates
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Date *
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
                            Return Date *
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
                        Pickup & Return Locations
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Location *
                          </label>
                          <input
                            {...register('pickupLocation')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Agadir Airport"
                          />
                          {errors.pickupLocation && (
                            <p className="text-red-500 text-sm mt-1">{errors.pickupLocation.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Return Location *
                          </label>
                          <input
                            {...register('returnLocation')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Same as pickup"
                          />
                          {errors.returnLocation && (
                            <p className="text-red-500 text-sm mt-1">{errors.returnLocation.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* License Information */}
                   

                    {/* Special Requests */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Additional Information
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Requests (Optional)
                        </label>
                        <textarea
                          {...register('specialRequests')}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Any special requests or additional information..."
                        />
                      </div>
                    </div>

                    {/* Rental Summary */}
                    {days > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Rental Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Rental Duration:</span>
                            <span className="font-medium">{days} day{days > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price per day:</span>
                            <span className="font-medium">DH {carPrice}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold border-t pt-2">
                            <span>Total Price:</span>
                            <span className="text-blue-600">DH {total}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {submitStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">
                          There was an error submitting your booking. Please try again or contact us directly.
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
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          'Submit Booking'
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
