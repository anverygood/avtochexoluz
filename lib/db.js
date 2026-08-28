// Oddiy JSON-fayl asosidagi "baza". Har bir data/*.json fayl bitta jadval
// vazifasini bajaradi. Kichik ustaxona sayti uchun bu yetarli — agar kelajakda
// yozuvlar soni ko'payib ketsa, shu faylni almashtirib, MongoDB/SQLite kabi
// haqiqiy bazaga o'tish mumkin (qolgan kod o'zgarmaydi, chunki funksiyalar
// nomi bir xil qoladi: readAll, findById, insert, update, remove).

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readAll(name) {
  const raw = fs.readFileSync(filePath(name), "utf-8");
  return JSON.parse(raw);
}

function writeAll(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

function readSettings() {
  return readAll("settings");
}

function writeSettings(data) {
  writeAll("settings", data);
}

function nextId(list) {
  if (list.length === 0) return 1;
  return Math.max(...list.map((item) => item.id)) + 1;
}

function insert(name, item) {
  const list = readAll(name);
  const newItem = { id: nextId(list), ...item };
  list.push(newItem);
  writeAll(name, list);
  return newItem;
}

function update(name, id, changes) {
  const list = readAll(name);
  const idx = list.findIndex((item) => item.id === Number(id));
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...changes, id: list[idx].id };
  writeAll(name, list);
  return list[idx];
}

function remove(name, id) {
  const list = readAll(name);
  const filtered = list.filter((item) => item.id !== Number(id));
  writeAll(name, filtered);
  return filtered;
}

// ============================================================
// AVTOMOBIL ICHIDAGI XIZMATLAR (nested services) uchun maxsus
// funksiyalar — har bir mashinaning o'z alohida narxlar ro'yxati bor.
// ============================================================

function getCar(carId) {
  const cars = readAll("cars");
  return cars.find((c) => c.id === Number(carId)) || null;
}

function addCarService(carId, service) {
  const cars = readAll("cars");
  const car = cars.find((c) => c.id === Number(carId));
  if (!car) return null;
  const newService = { id: nextId(car.services), ...service };
  car.services.push(newService);
  writeAll("cars", cars);
  return newService;
}

function updateCarService(carId, serviceId, changes) {
  const cars = readAll("cars");
  const car = cars.find((c) => c.id === Number(carId));
  if (!car) return null;
  const idx = car.services.findIndex((s) => s.id === Number(serviceId));
  if (idx === -1) return null;
  car.services[idx] = { ...car.services[idx], ...changes, id: car.services[idx].id };
  writeAll("cars", cars);
  return car.services[idx];
}

function removeCarService(carId, serviceId) {
  const cars = readAll("cars");
  const car = cars.find((c) => c.id === Number(carId));
  if (!car) return null;
  car.services = car.services.filter((s) => s.id !== Number(serviceId));
  writeAll("cars", cars);
  return car;
}

module.exports = {
  readAll,
  writeAll,
  readSettings,
  writeSettings,
  insert,
  update,
  remove,
  getCar,
  addCarService,
  updateCarService,
  removeCarService,
};
