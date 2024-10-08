import { useFormik } from "formik";
import { useState } from "react";
import axios from "axios";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import data from "../../il-ilceler-data.json";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./AddCustomer.module.css";
import BackButton from "../BackButton";

const AddCustomerSchema = Yup.object({
  tc_no: Yup.string()
    .length(11, "TC Kimlik Numarası 11 haneli olmalıdır.")
    .required("Bu alan boş bırakılamaz!"),
  birth_date: Yup.date().required("Bu alan boş bırakılamaz!"),
  first_name: Yup.string().required("Bu alan boş bırakılamaz!"),
  last_name: Yup.string().required("Bu alan boş bırakılamaz!"),
  province: Yup.string().required("Bu alan boş bırakılamaz!"),
  district: Yup.string().required("Bu alan boş bırakılamaz!"),
  phone_number: Yup.string()
    .matches(
      /^[1-9][0-9]{9}$/,
      "Lütfen telefon numaranızı başında 0 olmadan 10 haneli olarak giriniz."
    )
    .required("Bu alan boş bırakılamaz!"),
  email: Yup.string()
    .email("Geçersiz email adresi!")
    .required("Bu alan boş bırakılamaz!"),
});

export default function AddCustomer() {
  const formik = useFormik({
    initialValues: {
      tc_no: "",
      birth_date: "",
      first_name: "",
      last_name: "",
      province: "",
      district: "",
      phone_number: "",
      email: "",
    },
    validationSchema: AddCustomerSchema,
    onSubmit: (values) => handleSubmit(values),
  });

  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/customers/yeni-musteri",
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        alert("Müşteri başarıyla eklendi!");
        navigate("/dashboard");
      } else {
        alert("Müşteri eklenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        const errorMessage =
          error.response.data.message || "Lütfen bütün alanları doldurunuz!";
        alert(errorMessage);
      } else {
        alert("Bir hata oluştu!");
      }
    }
  };

  // il bilgileri
  const provinces = data.data.map((province) => ({
    value: province.il_adi,
    label: province.il_adi,
  }));

  // ilçe bilgileri
  const districts = data.data.flatMap((province) =>
    province.ilceler.map((district) => ({
      value: district.ilce_adi,
      label: district.ilce_adi,
      province: province.il_adi,
    }))
  );

  const [selectedProvince, setSelectedProvince] = useState("");
  const [filteredDistricts, setFilteredDistricts] = useState([]);

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setFilteredDistricts(
      districts.filter((district) => district.province === province)
    );
    formik.setFieldValue("province", province);
    formik.setFieldValue("district", "");
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    formik.setFieldValue("district", district);
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1>Yeni Müşteri</h1>
      <form className={styles.addCustomerForm} onSubmit={formik.handleSubmit}>
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="tc_no">TC Kimlik Numarası</label>
            <input
              id="tc_no"
              maxLength={11}
              name="tc_no"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.tc_no}
            />
            {formik.touched.tc_no && formik.errors.tc_no ? (
              <div className={styles.error}>{formik.errors.tc_no}</div>
            ) : null}
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="birth_date">Doğum Tarihi</label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.birth_date}
            />
            {formik.touched.birth_date && formik.errors.birth_date ? (
              <div className={styles.error}>{formik.errors.birth_date}</div>
            ) : null}
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="first_name">İsim</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.first_name}
            />
            {formik.touched.first_name && formik.errors.first_name ? (
              <div className={styles.error}>{formik.errors.first_name}</div>
            ) : null}
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="last_name">Soyisim</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.last_name}
            />
            {formik.touched.last_name && formik.errors.last_name ? (
              <div className={styles.error}>{formik.errors.last_name}</div>
            ) : null}
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="province">İl</label>
            <select
              id="province"
              name="province"
              onChange={handleProvinceChange}
              value={formik.values.province}
            >
              <option value="">İl Seçiniz</option>
              {provinces.map((province) => (
                <option key={province.value} value={province.value}>
                  {province.label}
                </option>
              ))}
            </select>
            {formik.touched.province && formik.errors.province ? (
              <div className={styles.error}>{formik.errors.province}</div>
            ) : null}
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="district">İlçe</label>
            <select
              id="district"
              name="district"
              onChange={handleDistrictChange}
              value={formik.values.district}
              disabled={!selectedProvince}
            >
              <option value="">İlçe Seçiniz</option>
              {filteredDistricts.map((district) => (
                <option key={district.value} value={district.value}>
                  {district.label}
                </option>
              ))}
            </select>
            {formik.touched.district && formik.errors.district ? (
              <div className={styles.error}>{formik.errors.district}</div>
            ) : null}
          </div>
        </div>

        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="phone_number">Telefon Numarası</label>
            <input
              id="phone_number"
              name="phone_number"
              type="text"
              maxLength={10}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone_number}
            />
            {formik.touched.phone_number && formik.errors.phone_number ? (
              <div className={styles.error}>{formik.errors.phone_number}</div>
            ) : null}
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className={styles.error}>{formik.errors.email}</div>
            ) : null}
          </div>
        </div>

        <button type="submit">Kaydet</button>
      </form>
    </div>
  );
}
