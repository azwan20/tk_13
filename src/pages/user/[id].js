import { useEffect, useState } from "react";
import { db } from "../../../public/firbaseConfig";
import { getDocs, collection, updateDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";

async function updateDataInFirebase(userId, jenisSampah, berat, harga, poin, tanggalAdd) {
    try {
        const userDocRef = doc(db, "user", userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            const newSetoran = {
                jenisSampah,
                berat,
                harga,
                poin,
                tanggalAdd,
            };
            const updatedRiwayats = [...(userData.riwayats || []), newSetoran];

            await updateDoc(userDocRef, {
                riwayats: updatedRiwayats
            });

            console.log("Document updated successfully");
            return true;
        } else {
            console.error("User document not found");
            return false;
        }
    } catch (error) {
        console.error("Error updating document", error);
        return false;
    }
}

async function fetchDataFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "dataSampah"));
    const data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}

async function fetchData_ModelTransaksi(id) {
    const docRef = doc(db, "user", id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
        const data = { id: docSnapshot.id, ...docSnapshot.data() };
        return data;
    } else {
        // Handle case where the document doesn't exist
        return null;
    }
}

export default function Home() {
    const [jenisSampah, setjenisSampah] = useState("");
    const [berat, setberat] = useState(0);
    const [harga, setharga] = useState(0);
    const [poin, setpoin] = useState(0);
    const [tanggalAdd, settanggalAdd] = useState("");
    const router = useRouter();
    const { id } = router.query;

    const [details, setDetails] = useState(true);
    const [dataSampah, setDataSampah] = useState([]);
    const [dataUser, setdataUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true); // State untuk menunggu data user
    const [jenis, setJenis] = useState({});

    console.log(dataUser);

    useEffect(() => {
        async function fetchData() {
            const data = await fetchDataFromFirestore();
            setDataSampah(data);
        }
        fetchData();
    }, []);

    useEffect(() => {
        async function fetchData() {
            if (id) {
                const data = await fetchData_ModelTransaksi(id);
                setdataUser(data);
                setLoadingUser(false); // Data user sudah terisi, set loading menjadi false
            }
        }
        fetchData();
    }, [id]);

    useEffect(() => {
        if (jenis.harga && jenis.poin) {
            setharga(jenis.harga * berat);
            setpoin(jenis.poin * berat);
        }
    }, [berat, jenis]);

    const handleDetails = () => {
        setDetails(!details);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const added = await updateDataInFirebase(dataUser.id, jenisSampah, berat, harga, poin, tanggalAdd);
        if (added) {
            setjenisSampah("");
            setberat(0);
            setharga(0);
            setpoin(0);
            settanggalAdd("");
            const updatedData = await fetchDataFromFirestore();
            setDataSampah(updatedData);
            alert("Data berhasil di upload");
            location.reload();
        } else {
            alert("Data tidak berhasil di upload");
        }
        setDetails(true);
    };

    const handleSampah = (event) => {
        const selectedName = event.target.value;
        const selectedItem = dataSampah.find(item => item.jenisSampah === selectedName);
        setJenis(selectedItem || {});
        setjenisSampah(selectedName);
    };

    if (loadingUser) {
        return <div>Loading...</div>; // Tampilkan loader saat menunggu data user
    }

    return (
        <>
            <div className="home d-flex">
                <section className="sidebar">
                    <span>
                        <h1 className="text-center my-5">{dataUser?.namaUser || 'Loading...'}</h1>
                        <div className="d-flex mt-5 ms-4">
                            <span className="d-grid me-3">
                                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.5 2.5H7.5C6.125 2.5 5 3.625 5 5V25C5 26.375 6.125 27.5 7.5 27.5H22.5C23.875 27.5 25 26.375 25 25V5C25 3.625 23.875 2.5 22.5 2.5ZM11.25 5H13.75V11.25L12.5 10.3125L11.25 11.25V5ZM22.5 25H7.5V5H8.75V16.25L12.5 13.4375L16.25 16.25V5H22.5V25Z" fill="white" />
                                </svg>
                            </span>
                            <span>
                                <Link href="/user" style={{ textDecoration: 'none', color: '#fff' }}>
                                    <p>Riwayat Setoran</p>
                                </Link>
                            </span>
                        </div>
                    </span>
                    <span style={{ width: '100%', textAlign: 'center' }}>
                        <Link href="/">
                            <button className="bg-danger mb-4 fw-bold text-light px-3 py-2 border-0 rounded">LOGOUT</button>
                        </Link>
                    </span>
                </section>
                <section className="d-flex justify-content-center align-items-center" style={{ width: '80%', maxHeight: '100%', overflowY: 'auto' }}>
                    <div className="content">
                        <div className="jurusan">
                            <div className="text-center mb-5">
                                <h4>Form Setoran Sampah</h4>
                                <h5 className="card-title mt-3">Hello {dataUser?.namaUser}! Mau setor sampah apa hari ini?</h5>
                            </div>
                            <div className="tabel">
                                <div className="head d-flex justify-content-between align-items-center">
                                    <p>Data Sampah Yang di Setorkan</p>
                                    <button onClick={handleDetails}>+</button>
                                </div>
                                <div className="form">
                                    {!details && (
                                        <form className="row" onSubmit={handleSubmit}>
                                            <div className="col-4 mb-3">
                                                <label htmlFor="jenisSampah" className="form-label">Jenis Sampah</label>
                                                <select
                                                    className="form-select"
                                                    id="jenisSampah"
                                                    aria-label="Select Jenis Sampah"
                                                    value={jenisSampah}
                                                    onChange={handleSampah}
                                                >
                                                    <option value="">Select Jenis Sampah</option>
                                                    {dataSampah.map((item) => (
                                                        <option key={item.id} value={item.jenisSampah}>
                                                            {item.jenisSampah}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-4 mb-3">
                                                <label htmlFor="berat" className="form-label">Berat (kg)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="berat"
                                                    value={berat}
                                                    onChange={(e) => setberat(parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <div className="col-4 mb-3">
                                                <label htmlFor="harga" className="form-label">Harga</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="harga"
                                                    value={harga}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="col-4 mb-3">
                                                <label htmlFor="poin" className="form-label">Poin</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="poin"
                                                    value={poin}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="col-4 mb-3">
                                                <label htmlFor="tanggalAdd" className="form-label">Tanggal</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="tanggalAdd"
                                                    value={tanggalAdd}
                                                    onChange={(e) => settanggalAdd(e.target.value)} required
                                                />
                                            </div>
                                            <div className="col-4 mb-3 d-flex align-items-end">
                                                <button type="submit" className="btn btn-primary w-100">Submit</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                            <h3>Riwayat Setoran</h3>
                            {dataUser && (
                                <div className="riwayat">
                                    {dataUser.riwayats && dataUser.riwayats.map((riwayat, index) => (
                                        <div key={index} className="card mb-3">
                                            <div className="card-body d-flex">
                                                <div className="text">
                                                    <div >
                                                        <p className="card-text">{riwayat.jenisSampah}</p>
                                                        <p className="card-text">Berat: {riwayat.berat} kg</p>
                                                        <p className="card-text">Harga: {riwayat.harga}</p>
                                                        <p className="card-text">Poin: {riwayat.poin}</p>
                                                        <p className="card-text">Tanggal: {riwayat.tanggalAdd}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
