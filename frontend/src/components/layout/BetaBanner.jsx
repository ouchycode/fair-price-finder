import React from "react";
import { X, AlertTriangle } from "lucide-react";
import { useLanguage } from "../../hooks/useI18n";

const BetaBanner = ({ visible, onDismiss }) => {
  const { t } = useLanguage();

  if (!visible) return null;

  return (
    <div className="announce-bar" role="alert">
      <div className="announce-bar__inner">
        <div className="announce-bar__left">
          <span className="announce-bar__badge">
            <AlertTriangle size={9} strokeWidth={2.5} />
            {t("beta.badge")}
          </span>
        </div>

        <p className="announce-bar__msg">
          <span className="announce-bar__desktop-text">
            {t("beta.desktopPre")}
            <span className="announce-bar__msg-em">
              {t("beta.desktopEm")}
            </span>
          </span>
          <span className="announce-bar__mobile-text">
            {t("beta.mobile")}
          </span>
        </p>

        <button
          className="announce-bar__close"
          onClick={onDismiss}
          aria-label={t("beta.closeAria")}
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default BetaBanner;