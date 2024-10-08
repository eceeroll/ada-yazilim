const Customer = require("../models/Customer");
const Policy = require("../models/Policy");

const generateCustomerNumber = () => {
  // 100000 ile 999999 arasında rastgele bir sayı üretir
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// USER / ADD CUSTOMER
exports.addCustomer = async (req, res) => {
  try {
    const {
      tc_no,
      birth_date,
      first_name,
      last_name,
      province,
      district,
      phone_number,
      email,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let newCustomerNumber;
    let isUnique = false;

    // benzersiz mi diye kontrol et
    while (!isUnique) {
      newCustomerNumber = generateCustomerNumber();
      const existingCustomer = await Customer.findOne({
        musteriNo: newCustomerNumber,
      }).exec();
      if (!existingCustomer) {
        isUnique = true;
      }
    }

    const newCustomer = new Customer({
      musteri_no: newCustomerNumber,
      first_name,
      last_name,
      tc_no,
      date_of_birth: birth_date,
      province,
      district,
      phone_number,
      email,
      addedBy:
        {
          id: req.user.id,
          username: req.user.username,
        } || null,
    });

    await newCustomer.save();

    res
      .status(201)
      .json({ message: "Customer added successfully!", customer: newCustomer });
  } catch (error) {
    if (error.code && error.code === 11000) {
      // Benzersizlik hatası
      return res
        .status(400)
        .json({ message: "Bu TC Kimlik Numarası zaten kayıtlı." });
    }

    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// USER / SEARCH CUSTOMERS
exports.searchCustomers = async (req, res) => {
  const { first_name, last_name, tc_no } = req.query;

  // mongodb sorgusu için nesne oluşturulur
  const query = {
    "addedBy.id": req.user.id, // addedBy içindeki id'yi sorguluyoruz
  };

  if (tc_no) {
    query.tc_no = new RegExp(tc_no, "i");
  }
  if (first_name) {
    query.first_name = new RegExp(first_name, "i");
  }
  if (last_name) {
    query.last_name = new RegExp(last_name, "i");
  }

  if (!tc_no && !first_name && !last_name) {
    const allCustomers = await Customer.find(query);
    return res.json(allCustomers);
  }

  const customers = await Customer.find(query);
  res.json(customers);
};

exports.getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Müşteri Bulunamadı" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

// USER / UPDATE CUSTOMER
exports.updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const updateData = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Müşteri Bulunamadı" });
    }

    res.json({
      message: "Müşteri Bilgileri Güncellendi",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

// USER / DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findByIdAndDelete(customerId);

    if (!customer) {
      res.status(404).json({ message: "Müşteri Bulunamadı" });
    }

    res.json({ message: "Müşteri Başarıyla Silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

// GET POLICIES BELONG TO CUSTOMER

exports.getPolicies = async (req, res) => {
  try {
    const { musteriNo } = req.params; // URL'den müşteri numarasını alın

    // Müşteri numarasına göre poliçeleri sorgulama
    const policies = await Policy.find({
      "musteriBilgileri.musteriNo": musteriNo,
    });

    if (!policies || policies.length === 0) {
      return res
        .status(404)
        .json({ message: "No policies found for this customer." });
    }

    res.status(200).json(policies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
