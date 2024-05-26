import { useEffect, useState } from "react"
import { db } from "../../../public/firbaseConfig";
import { getDocs, getDoc, collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/router";

async function addDataToFirebase(namaMatkul, kodeMatkul, prodi, pengampu, semester, tanggalAdd, deskripsi,
) {
    try {
        const docRefSurat = await addDoc(collection(db, "matkul"), {
            namaMatkul: namaMatkul,
            kodeMatkul: kodeMatkul,
            prodi: prodi,
            pengampu: pengampu,
            semester: semester,
            tanggalAdd: tanggalAdd,
            deskripsi: deskripsi,
        })
        console.log("Document input document ID : ", docRefSurat.id);
        return true;

    } catch (error) {
        console.error("error input document", error);
        return false;
    }
}

async function fetchDataFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "matkul"));
    const data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}

async function fetchDataFromFirestoreJurusan() {
    const querySnapshot = await getDocs(collection(db, "jurusan"));
    const data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}

async function fetchDataFromFirestoreDsosen() {
    const querySnapshot = await getDocs(collection(db, "dosen"));
    const data = [];
    querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}

export default function DataMatkul() {
    const [namaMatkul, setNamaMatkul] = useState("");
    const [kodeMatkul, setKodeMatkul] = useState("");
    const [prodi, setProdi] = useState("");
    const [pengampu, setPengampu] = useState("");
    const [semester, setSemester] = useState("");
    const [tanggalAdd, setTanggalAdd] = useState("");
    const [deskripsi, setDeskripsi] = useState("");

    const [details, setDetails] = useState(true);

    const handleDetails = () => {
        setDetails(!details);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const added = await addDataToFirebase(namaMatkul, kodeMatkul, prodi, pengampu, semester, tanggalAdd, deskripsi,
        );
        if (added) {
            setNamaMatkul("");
            setKodeMatkul("");
            setProdi("");
            setPengampu("");
            setSemester(""),
                setTanggalAdd("");
            setDeskripsi("");
            alert("Data berhasil di upload");
            const updatedData = await fetchDataFromFirestore();
            setDataSurat(updatedData);
        } else {
            alert("Data tidak berhasil di upload");
        }
        setDetails(true);
        
    }

    const router = useRouter();
    const { id } = router.query;
    const [dataSurat, setDataSurat] = useState([]);
    const [selectedNama, setSelectedNama] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [dataJurusans, setDataJurusan] = useState({});
    const [datadosens, sertdatadosens] = useState({});

    useEffect(() => {
        async function fetchData() {
            const data = await fetchDataFromFirestore();
            setDataSurat(data);
            const dataJurusan = await fetchDataFromFirestoreJurusan();
            setDataJurusan(dataJurusan);
            const dataDosen = await fetchDataFromFirestoreDsosen();
            sertdatadosens(dataDosen);

        }
        fetchData();
    }, []);

    // const handleNamaChange = (event) => {
    //     setSelectedNama(event.target.value);
    // };

    console.log(dataJurusans);
    console.log("data surat", dataSurat);

    const selectedItem = dataSurat.find(item => item.namaMatkul === selectedNama);

    const handleNamaChange = (event) => {
        const selectedName = event.target.value;
        setSelectedNama(selectedName);
        const selectedItem = dataSurat.find(item => item.namaMatkul === selectedName);
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
            const docRef = doc(db, "matkul", formData.id);
            await updateDoc(docRef, formData);
            setIsEditMode(false);
            const updatedData = await fetchDataFromFirestore();
            setDataSurat(updatedData);
        }
        alert("Data berhasil di Update");
    };

    const handleDeleteClick = async () => {
        if (formData.id) {
            const docRef = doc(db, "matkul", formData.id);
            await deleteDoc(docRef);
            setIsEditMode(false);
            const updatedData = await fetchDataFromFirestore();
            setDataSurat(updatedData);
            setSelectedNama('');
            setFormData({});
            alert("Data berhasil di Hapus");
        }
    };

    const handleBatal = () => {
        setIsEditMode(false);
    }
    return (
        <>
            <div className="jurusan">
                <div className="text-center mb-5">
                    <h3 className="mb-4">DATA MATA KULIAH</h3>
                    <select
                        style={{ width: '20%', margin: 'auto', border: '3px solid #6AD4DD' }}
                        value={selectedItem}
                        onChange={handleNamaChange}
                        className="px-1"
                    >
                        <option value="">Pilih Nama</option>
                        {dataSurat.map((item, index) => (
                            <option key={index} value={item.namaMatkul}>{item.namaMatkul}</option>
                        ))}
                    </select>
                </div>
                {!details ? (
                    <section>
                        <form onSubmit={handleSubmit} method="post" action="">
                            <p>Nama Mata Kuliah:</p>
                            <input type="text" onChange={(e) => setNamaMatkul(e.target.value)} required />

                            <p>Kode Mata Kuliah:</p>
                            <input type="text" onChange={(e) => setKodeMatkul(e.target.value)} required />

                            <p>Program Studi :</p>
                            <select onChange={(e) => setProdi(e.target.value)} required>
                            <option value="" disabled selected>Pilih</option>
                                {dataJurusans.map((items, index) => (
                                    <option key={index} value={items.namaJurusan}>{items.namaJurusan}</option>
                                ))}
                            </select>

                            <p>Dosen Pengampu:</p>
                            <select name="dosen" onChange={(e) => setPengampu(e.target.value)} required>
                                <option value="" disabled selected>Pilih</option>
                                {datadosens.map((item, index) => (
                                    <option key={index} value={item.namaDosen}>
                                        {item.namaDosen}
                                    </option>
                                ))}
                            </select>

                            <p>Jumlah Semester:</p>
                            <input type="number" onChange={(e) => setSemester(e.target.value)} required />

                            <p>Tanggal Ditambahkan:</p>
                            <input type="date" onChange={(e) => setTanggalAdd(e.target.value)} required />

                            <p>Deskripsi Mata Kuliah:</p>
                            <textarea onChange={(e) => setDeskripsi(e.target.value)} required></textarea>

                            <div className="d-flex justify-content-around">
                                <button onClick={handleDetails} className="bg-danger">BATAL</button>
                                <button type="submit">SIMPAN</button>
                            </div>
                        </form>
                    </section>
                ) : isEditMode && selectedItem ? (
                    <section className="detail ps-5 pb-5">
                        <span>
                            <p>Nama Mata Kuliah</p>
                            <input type="text"
                                name="namaMatkul"
                                onChange={handleInputChange}
                                value={formData.namaMatkul || ''} />
                        </span>
                        <span>
                            <p>Kode Mata Kuliah</p>
                            <input type="text"
                                name="kodeMatkul"
                                onChange={handleInputChange}
                                value={formData.kodeMatkul || ''} />
                        </span>
                        <span>
                            <p>Program Studi</p>
                            <select name="prodi"
                                onChange={handleInputChange}
                                value={formData.prodi || ''} required>
                                <option value="" disabled selected>Pilih</option>
                                {dataJurusans.map((items, index) => (
                                    <option key={index} value={items.namaJurusan}>{items.namaJurusan}</option>
                                ))}
                            </select>
                        </span>
                        <span>
                            <p>Dosen Pengampu</p>
                            <select name="pengampu"
                                onChange={handleInputChange}
                                value={formData.pengampu || ''} required>
                                <option value="" disabled selected>Pilih</option>
                                {datadosens.map((item, index) => (
                                    <option key={index} value={item.namaDosen}>
                                        {item.namaDosen}
                                    </option>
                                ))}
                            </select>
                        </span>
                        <span>
                            <p>Jumlah Semester</p>
                            <input type="text"
                                name="semester"
                                onChange={handleInputChange}
                                value={formData.semester || ''} />
                        </span>
                        <span>
                            <p>Tanggal Ditambahkan</p>
                            <input type="text"
                                name="tanggalAdd"
                                onChange={handleInputChange}
                                value={formData.tanggalAdd || ''} />
                        </span>
                        <span>
                            <p>Deskripsi Jurusan</p>
                            <input type="text"
                                name="deskripsi"
                                onChange={handleInputChange}
                                value={formData.deskripsi || ''} />
                        </span>
                        {isEditMode && (
                            <span className="d-flex justify-content-around" style={{ width: '100%' }}>
                                <button onClick={handleBatal}>Batal</button>
                                <button className="mx-2 bg-success" onClick={handleSaveClick}>Simpan</button>
                                <button className="bg-danger" onClick={handleDeleteClick}>Hapus</button>
                            </span>
                        )}
                    </section>
                ) : (
                    <section className="detail ps-5 pb-5">
                        <span>
                            <p>Nama Mata Kuliah</p>
                            <b>: {formData.namaMatkul || ''}</b>
                        </span>
                        <span>
                            <p>Kode Mata Kuliah</p>
                            <b>: {formData.kodeMatkul || ''}</b>
                        </span>
                        <span>
                            <p>Program Studi</p>
                            <b>: {formData.prodi || ''}</b>
                        </span>
                        <span>
                            <p>Dosen Pengampu</p>
                            <b>: {formData.pengampu || ''}</b>
                        </span>
                        <span>
                            <p>Jumlah Semester</p>
                            <b>: {formData.semester || ''}</b>
                        </span>
                        <span>
                            <p>Tanggal Ditambahkan</p>
                            <b>: {formData.tanggalAdd || ''}</b>
                        </span>
                        <span>
                            <p>Deskripsi Jurusan</p>
                            <b>: {formData.deskripsi || ''}</b>
                        </span>
                        <button onClick={handleDetails} className="add" type="submit">+</button>
                        <button className="edited" onClick={handleEditClick}><svg className="my-auto" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 12C20.7348 12 20.4804 12.1054 20.2929 12.2929C20.1054 12.4804 20 12.7348 20 13V19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V5C4 4.73478 4.10536 4.48043 4.29289 4.29289C4.48043 4.10536 4.73478 4 5 4H11C11.2652 4 11.5196 3.89464 11.7071 3.70711C11.8946 3.51957 12 3.26522 12 3C12 2.73478 11.8946 2.48043 11.7071 2.29289C11.5196 2.10536 11.2652 2 11 2H5C4.20435 2 3.44129 2.31607 2.87868 2.87868C2.31607 3.44129 2 4.20435 2 5V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V13C22 12.7348 21.8946 12.4804 21.7071 12.2929C21.5196 12.1054 21.2652 12 21 12ZM6 12.76V17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18H11.24C11.3716 18.0008 11.5021 17.9755 11.6239 17.9258C11.7457 17.876 11.8566 17.8027 11.95 17.71L18.87 10.78L21.71 8C21.8037 7.90704 21.8781 7.79644 21.9289 7.67458C21.9797 7.55272 22.0058 7.42201 22.0058 7.29C22.0058 7.15799 21.9797 7.02728 21.9289 6.90542C21.8781 6.78356 21.8037 6.67296 21.71 6.58L17.47 2.29C17.377 2.19627 17.2664 2.12188 17.1446 2.07111C17.0227 2.02034 16.892 1.9942 16.76 1.9942C16.628 1.9942 16.4973 2.02034 16.3754 2.07111C16.2536 2.12188 16.143 2.19627 16.05 2.29L13.23 5.12L6.29 12.05C6.19732 12.1434 6.12399 12.2543 6.07423 12.3761C6.02446 12.4979 5.99924 12.6284 6 12.76ZM16.76 4.41L19.59 7.24L18.17 8.66L15.34 5.83L16.76 4.41ZM8 13.17L13.93 7.24L16.76 10.07L10.83 16H8V13.17Z" fill="white" />
                        </svg>
                        </button>
                    </section>

                )}
            </div>
        </>
    )
}