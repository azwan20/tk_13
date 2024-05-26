import { useEffect, useState } from "react";
import { db } from "../../../public/firbaseConfig";
import { getDocs, collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/router";

async function addDataToFirebase(jenisSampah, berat, harga, poin, tanggalAdd) {
    try {
        const docRefSurat = await addDoc(collection(db, "dataSampah"), {
            jenisSampah: jenisSampah,
            berat: berat,
            harga: harga,
            poin: poin,
            tanggalAdd: tanggalAdd,
        });
        console.log("Document input document ID : ", docRefSurat.id);
        return true;
    } catch (error) {
        console.error("error input document", error);
        return false;
    }
}

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
    const [isEditMode, setIsEditMode] = useState(false);
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

    const handleDetails = () => {
        setDetails(!details);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const added = await addDataToFirebase(jenisSampah, berat, harga, poin, tanggalAdd);
        if (added) {
            setjenisSampah("");
            setberat(0);
            setHargaPerKg(0);
            setPoinPerKg(0);
            setharga(0);
            setpoin(0);
            settanggalAdd("");
            const updatedData = await fetchDataFromFirestore();
            setDataSampah(updatedData);
            alert("Data berhasil di upload");
        } else {
            alert("Data tidak berhasil di upload");
        }
        setDetails(true);
    };

    const selectedItem = dataSampah.find(item => item.namaUser === selectedNama);

    const handleNamaChange = (event) => {
        const selectedName = event.target.value;
        setSelectedNama(selectedName);
        const selectedItem = dataSampah.find(item => item.namaUser === selectedName);
        setFormData(selectedItem || {});
    };

    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveClick = async () => {
        if (formData.id) {
            const docRef = doc(db, "dataSampah", formData.id);
            await updateDoc(docRef, formData);
            setIsEditMode(false);
            const updatedData = await fetchDataFromFirestore();
            setDataSampah(updatedData);
        }
        alert("Data berhasil di Update");
    };

    const handleDeleteClick = async () => {
        if (formData.id) {
            const docRef = doc(db, "dataSampah", formData.id);
            await deleteDoc(docRef);
            setIsEditMode(false);
            const updatedData = await fetchDataFromFirestore();
            setDataSampah(updatedData);
            setSelectedNama('');
            setFormData({});
            alert("Data berhasil di Hapus");
        }
    };

    const handleBatal = () => {
        setIsEditMode(false);
    };

    return (
        <>
            <div className="jurusan">
                <div className="text-center mb-5">
                    <h3 className="mb-4">DATA RIWAYAT</h3>
                    <select
                        style={{ width: '20%', margin: 'auto', border: '3px solid #6F4E37' }}
                        value={selectedItem}
                        onChange={handleNamaChange}
                        className="px-1"
                    >
                        <option value="">Pilih Nama</option>
                        {dataSampah.map((item, index) => (
                            <option key={index} value={item.namaUser}>{item.namaUser}</option>
                        ))}
                    </select>

                </div>
                {details && (
                    <div>
                        <section className="detail ps-5 pb-5">
                            <span>
                                <p>Nama User</p>
                                <b>: {formData.namaUser || ''}</b>
                            </span>
                            <span>
                                <p>Jenis Sampah Anorganik</p>
                                <b>: {formData.jenisSampah || ''}</b>
                            </span>
                            <span>
                                <p>Berat Sampah</p>
                                <b>: {formData.berat || ''}</b>
                            </span>
                            <span>
                                <p>Harga Jual</p>
                                <b>: {formData.harga || ''}</b>
                            </span>
                            <span>
                                <p>Poin Yang Didapatkan</p>
                                <b>: {formData.poin || ''}</b>
                            </span>
                            <span>
                                <p>Tanggal Ditambahkan</p>
                                <b>: {formData.tanggalAdd || ''}</b>
                            </span>
                        </section>
                    </div>
                )}
            </div>
        </>
    );
}
