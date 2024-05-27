import { useEffect, useState } from "react";
import { db } from "../../../public/firbaseConfig";
import { getDocs, collection } from "firebase/firestore";
import { useRouter } from "next/router";

async function fetchDataFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "user"));
    const data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}

export default function DataRiwayat() {
    const [jenisSampah, setjenisSampah] = useState("");
    const [berat, setberat] = useState(0);
    const [hargaPerKg, setHargaPerKg] = useState(0);
    const [poinPerKg, setPoinPerKg] = useState(0);
    const [harga, setharga] = useState(0);
    const [poin, setpoin] = useState(0);
    const [tanggalAdd, settanggalAdd] = useState("");

    const [details, setDetails] = useState(true);
    const [dataSampah, setDataSampah] = useState([]);
    const [selectedNama, setSelectedNama] = useState('');
    const [formData, setFormData] = useState({});

    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        async function fetchData() {
            const data = await fetchDataFromFirestore();
            setDataSampah(data);
        }
        fetchData();
    }, []);

    useEffect(() => {
        setharga(hargaPerKg * berat);
        setpoin(poinPerKg * berat);
    }, [berat, hargaPerKg, poinPerKg]);

    const handleNamaChange = (event) => {
        const selectedName = event.target.value;
        setSelectedNama(selectedName);
        const selectedItem = dataSampah.find(item => item.namaUser === selectedName);
        setFormData(selectedItem || {});
    };

    return (
        <>
            <div className="jurusan">
                <div className="text-center mb-5">
                    <h3 className="mb-4 text-uppercase">DATA RIWAYAT {formData.namaUser || ''}</h3>
                    <select
                        style={{ width: '20%', margin: 'auto', border: '3px solid #6F4E37' }}
                        value={selectedNama}
                        onChange={handleNamaChange}
                        className="px-1"
                    >
                        <option value="">Pilih Nama</option>
                        {dataSampah.map((item, index) => (
                            <option key={index} value={item.namaUser}>{item.namaUser}</option>
                        ))}
                    </select>
                </div>
                {details && formData.namaUser && (
                    <div>
                        <div className="riwayat" style={{ width: '50%' }}>
                            {formData.riwayats && formData.riwayats.length > 0 ? (
                                formData.riwayats.map((riwayat, index) => (
                                    <section key={index} className="detail ps-5 pb-5">
                                        <span>
                                            <p>Tanggal Ditambahkan</p>
                                            <b>: {riwayat.tanggalAdd || ''}</b>
                                        </span>
                                        <span>
                                            <p>Jenis Sampah Anorganik</p>
                                            <b>: {riwayat.jenisSampah || ''}</b>
                                        </span>
                                        <span>
                                            <p>Berat Sampah</p>
                                            <b>: {riwayat.berat || ''}</b>
                                        </span>
                                        <span>
                                            <p>Harga Jual</p>
                                            <b>: {riwayat.harga || ''}</b>
                                        </span>
                                        <span>
                                            <p>Poin Yang Didapatkan</p>
                                            <b>: {riwayat.poin || ''}</b>
                                        </span>
                                    </section>
                                ))
                            ) : (
                                <p>Belum ada riwayat setoran.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
