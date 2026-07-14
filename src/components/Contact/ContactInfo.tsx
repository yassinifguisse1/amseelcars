"use client";

import React, { useState, useCallback, useMemo } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useTranslations } from "next-intl";
import styles from "./contact.module.css";

const mapContainerStyle = { width: "100%", height: "100%" };
const center = { lat: 30.4007408, lng: -9.577593 };
const MAPS_PLACE_URL =
  "https://www.google.com/maps/place/Amseel+cars/@30.4007453,-9.5824693,17z/data=!3m1!4b1!4m6!3m5!1s0xdb3b76e940846e9:0x4fa73710c2ac5d92!8m2!3d30.4007408!4d-9.577593!16s%2Fg%2F11w7lk46s0";

const mapOptions: google.maps.MapOptions = {
  mapTypeId: "terrain",
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  mapTypeControl: true,
};

type ReachRow = {
  label: string;
  value: string;
  href: string;
};

export function ContactReach() {
  const t = useTranslations("contactPage.info");

  const rows: ReachRow[] = useMemo(
    () => [
      {
        label: t("cardWhatsapp"),
        value: t("phoneValue"),
        href: "https://wa.me/212662500181",
      },
      {
        label: t("cardEmail"),
        value: t("emailValue"),
        href: `mailto:${t("emailValue")}`,
      },
      {
        label: t("cardAddress"),
        value: t("addressValue"),
        href: MAPS_PLACE_URL,
      },
    ],
    [t],
  );

  return (
    <section className={styles.reachSection} aria-labelledby="contact-reach-heading">
      <p className={styles.kicker}>Amseel Cars</p>
      <h2 id="contact-reach-heading" className={styles.h2}>
        {t("sectionTitle")}
      </h2>
      <p className={styles.lead}>{t("sectionLead")}</p>

      <ul className={styles.reachList}>
        {rows.map((row) => (
          <li key={row.label}>
            <a
              href={row.href}
              className={styles.reachItem}
              target={row.href.startsWith("http") ? "_blank" : undefined}
              rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <p className={styles.reachLabel}>{row.label}</p>
              <p className={styles.reachValue}>{row.value}</p>
            </a>
          </li>
        ))}
      </ul>

      <div className={styles.socialRow}>
        <p className={styles.socialLabel}>{t("followTitle")}</p>
        <div className={styles.socialLinks}>
          <a
            href="https://www.facebook.com/amseelcars/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label={t("socialFollowAria", { name: "Facebook" })}
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/amseelcars/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            aria-label={t("socialFollowAria", { name: "Instagram" })}
          >
            Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

export function ContactMap() {
  const t = useTranslations("contactPage.info");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const onMapLoad = useCallback(() => {
    setMapLoaded(true);
    setMapError(false);
  }, []);

  const onMapError = useCallback(() => {
    setMapError(true);
    setMapLoaded(false);
  }, []);

  return (
    <section className={styles.mapSection} aria-labelledby="contact-map-heading">
      <p className={styles.kicker}>Agadir</p>
      <h2 id="contact-map-heading" className={styles.h2}>
        {t("mapTitle")}
      </h2>

      <div className={styles.mapFrame}>
        {!apiKey ? (
          <div className={styles.mapFallback}>
            <p>{t("mapNoKey")}</p>
            <p className={styles.mapFallbackHint}>{t("mapNoKeyHint")}</p>
            <p>{t("mapFallbackAddress")}</p>
            <a
              href={MAPS_PLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              {t("mapOpenInMaps")}
            </a>
          </div>
        ) : mapError ? (
          <div className={styles.mapFallback}>
            <p>{t("mapError")}</p>
            <p>{t("mapFallbackAddress")}</p>
            <button
              type="button"
              className={styles.mapRetry}
              onClick={() => {
                setMapError(false);
                setMapLoaded(false);
              }}
            >
              {t("mapRetry")}
            </button>
          </div>
        ) : (
          <>
            {!mapLoaded ? (
              <div className={styles.mapLoading}>
                <span className={styles.spinner} aria-hidden />
                <span>{t("mapLoading")}</span>
              </div>
            ) : null}
            <LoadScript
              googleMapsApiKey={apiKey}
              onLoad={onMapLoad}
              onError={onMapError}
              loadingElement={
                <div className={styles.mapLoading}>
                  <span className={styles.spinner} aria-hidden />
                  <span>{t("mapLoadGoogle")}</span>
                </div>
              }
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
                options={mapOptions}
                onLoad={onMapLoad}
              >
                <Marker position={center} onClick={() => setShowInfoWindow(true)} />
                {showInfoWindow ? (
                  <InfoWindow
                    position={center}
                    onCloseClick={() => setShowInfoWindow(false)}
                  >
                    <div className={styles.mapInfoWindow}>
                      <h4>{t("mapInfoBusiness")}</h4>
                      <p>{t("mapInfoLine1")}</p>
                      <p>{t("mapInfoLine2")}</p>
                      <a
                        href={MAPS_PLACE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("mapOpenInMaps")}
                      </a>
                    </div>
                  </InfoWindow>
                ) : null}
              </GoogleMap>
            </LoadScript>
          </>
        )}
      </div>
    </section>
  );
}

/** @deprecated Prefer ContactReach + ContactMap */
export default function ContactInfo() {
  return (
    <>
      <ContactReach />
      <ContactMap />
    </>
  );
}
