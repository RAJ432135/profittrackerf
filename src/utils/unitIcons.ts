import { Truck, Bus, Store, Building2 } from "lucide-react-native";
import type { VehicleType } from "../types/domain";

/** One icon component per unit type, reused across Home/Vehicles/Vehicle detail. */
export function getUnitIcon(type: VehicleType) {
  switch (type) {
    case "Bus":
      return Bus;
    case "Shop":
    case "ShopOther":
      return Store;
    case "Branch":
      return Building2;
    case "Truck":
    case "MiniTruck":
    case "Pickup":
    default:
      return Truck;
  }
}
