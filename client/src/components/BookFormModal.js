import React, { useState, useEffect } from "react";

function BookFormModal({ book, onClose, onSave }) {
  const [formData, setFormData] = useState({
    judul_buku: "",
    pengarang: "",
    penerbit: "",
    tempat_terbit: "",
    tahun: "",
    isbn: "",
    jilid: "",
    edisi: "",
    cetakan: "",
    jumlah_halaman: "",
    rak_buku: "",
    jumlah_buku: "",
    tinggi_buku: "",
    nomor_panggil: "",
    inisial: "",
    perolehan: "",
    harga: "",
    keterangan: "",
    no_induk: "",
  });

  useEffect(() => {
    if (book) {
      setFormData({
        judul_buku: book.judul_buku || "",
        pengarang: book.pengarang || "",
        penerbit: book.penerbit || "",
        tempat_terbit: book.tempat_terbit || "",
        tahun: book.tahun || "",
        isbn: book.isbn || "",
        jilid: book.jilid || "",
        edisi: book.edisi || "",
        cetakan: book.cetakan || "",
        jumlah_halaman: book.jumlah_halaman || "",
        rak_buku: book.rak_buku || "",
        jumlah_buku: book.jumlah_buku || "",
        tinggi_buku: book.tinggi_buku || "",
        nomor_panggil: book.nomor_panggil || "",
        inisial: book.inisial || "",
        perolehan: book.perolehan || "",
        harga: book.harga || "",
        keterangan: book.keterangan || "",
        no_induk: book.no_induk || "",
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{book ? "Edit Buku" : "Tambah Buku"}</h2>
        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map((key) => (
            <div key={key} style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>
                {key.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookFormModal;
