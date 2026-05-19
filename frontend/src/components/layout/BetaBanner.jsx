import React from "react";
import { X, AlertTriangle } from "lucide-react";

const BetaBanner = ({ visible, onDismiss }) => {
  if (!visible) return null;

  return (
    <div className="announce-bar" role="alert">
      <div className="announce-bar__inner">
        <div className="announce-bar__left">
          <span className="announce-bar__badge">
            <AlertTriangle size={9} strokeWidth={2.5} />
            BETA
          </span>
        </div>

        <p className="announce-bar__msg">
          <span className="announce-bar__desktop-text">
            Data estimasi harga belum mencerminkan harga pasar aktual -{" "}
            <span className="announce-bar__msg-em">
              gunakan sebagai referensi awal, bukan acuan final.
            </span>
          </span>
          <span className="announce-bar__mobile-text">
            Estimasi harga hanya untuk referensi awal.
          </span>
        </p>

        <button
          className="announce-bar__close"
          onClick={onDismiss}
          aria-label="Tutup pemberitahuan beta"
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default BetaBanner;
