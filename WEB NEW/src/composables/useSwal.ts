import Swal from "sweetalert2";

interface ApiErrorShape {
  response?: {
    data?: {
      error?: string;
      details?: string;
    };
  };
  message?: string;
}

export function useSwal() {
  const showApiError = (error: unknown) => {
    const err = error as ApiErrorShape;

    Swal.fire({
      title: err.response?.data?.error || "Error",
      text: err.response?.data?.details || err.message,
      icon: "error",
    });
  };

  const showWarning = (title: string, text?: string) => {
    Swal.fire({
      title,
      text,
      icon: "warning",
    });
  };

  return { showApiError, showWarning };
}
