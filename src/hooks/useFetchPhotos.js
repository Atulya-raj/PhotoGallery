// src/hooks/useFetchPhotos.js
import { useState, useEffect, useCallback } from "react";

export function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(3);

  const refresh = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`https://picsum.photos/v2/list?page=${page}&limit=30`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch photos.");
        return res.json();
      })
      .then((data) => setPhotos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return { photos, loading, error, refresh };
}
