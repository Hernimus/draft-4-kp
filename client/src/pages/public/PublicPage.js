import { useEffect, useState } from "react";
import BookDetailModal from "../../components/BookDetailModal";

function PublicPage() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [rakFilter, setRakFilter] = useState("");
  const [rakList, setRakList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);

  // Fetch rak list
  useEffect(() => {
    fetch("http://localhost:3000/api/rak")
      .then((res) => res.json())
      .then((json) => setRakList(json))
      .catch((err) => console.error("Error rak:", err));
  }, []);

  // Fetch katalog data
  useEffect(() => {
    let url = `http://localhost:3000/api/katalog?page=${page}&limit=${limit}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;
    if (rakFilter) url += `&rak=${encodeURIComponent(rakFilter)}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        setData(json.data);
        setTotalPages(json.total_pages);
      })
      .catch((err) => console.error("Error:", err));
  }, [query, rakFilter, page, limit]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const renderPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (start > 1) {
      pages.push(
        <button key={1} onClick={() => setPage(1)} className="page-btn">
          1
        </button>
      );
      if (start > 2) pages.push(<span key="start-dots">...</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`page-btn ${i === page ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="end-dots">...</span>);
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className="page-btn"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>📚 Daftar Katalog Buku</h2>

      {/* Filter Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "15px" }}>
        <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={75}>75</option>
          <option value={100}>100</option>
        </select>

        <select value={rakFilter} onChange={e => { setRakFilter(e.target.value); setPage(1); }}>
          <option value="">Semua Rak</option>
          {rakList.map((rak, idx) => (
            <option key={idx} value={rak.value}>{rak.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cari judul, pengarang, atau ISBN..."
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: "200px", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "8px" }}
        />
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Judul Buku</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Pengarang</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Penerbit</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Tahun</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Rak</th>
            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: "6px", borderTop: "1px solid #ddd" }}>{row.judul_buku}</td>
                <td style={{ padding: "6px", borderTop: "1px solid #ddd" }}>{row.pengarang}</td>
                <td style={{ padding: "6px", borderTop: "1px solid #ddd" }}>{row.penerbit}</td>
                <td style={{ padding: "6px", borderTop: "1px solid #ddd" }}>{row.tahun}</td>
                <td style={{ padding: "6px", borderTop: "1px solid #ddd" }}>{row.rak_buku || ''}</td>
                <td style={{ padding: "6px", borderTop: "1px solid #ddd" }}>
                  <button
                    onClick={() => setSelectedBook(row)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Tidak ada data</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "5px", marginTop: "15px" }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          style={{ border: "none", background: "#eee", padding: "5px 10px", cursor: page <= 1 ? "not-allowed" : "pointer", borderRadius: "4px" }}
        >
          ⬅
        </button>

        {renderPageNumbers()}

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          style={{ border: "none", background: "#eee", padding: "5px 10px", cursor: page >= totalPages ? "not-allowed" : "pointer", borderRadius: "4px" }}
        >
          ➡
        </button>
      </div>

      {selectedBook && (
        <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}

export default PublicPage;
