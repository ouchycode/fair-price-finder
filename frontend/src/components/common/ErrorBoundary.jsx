import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="status-wrap">
          <div className="status-icon status-icon--error">
            <AlertTriangle size={22} color="var(--red)" />
          </div>

          <h2 className="status-title">Terjadi Kesalahan</h2>

          <p className="status-desc">
            Halaman ini mengalami error tak terduga. Coba refresh atau kembali ke halaman utama.
          </p>

          <div className="status-actions">
            <button
              className="btn-primary"
              style={{ fontSize: 13.5, padding: "9px 18px" }}
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/" className="btn-secondary" style={{ fontSize: 13.5, padding: "9px 18px" }}>
              Kembali ke Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
