/**
 * Comprehensive Inventory Update Service
 * Handles dynamic quantity updates throughout the entire workflow:
 * Binding Advice → Job Card → Dispatch → Billing
 */

export interface InventoryUpdateEvent {
  type: "reserve" | "release" | "consume" | "produce" | "dispatch" | "return";
  itemId: string;
  quantity: number;
  referenceId: string; // binding advice, job card, dispatch, etc.
  referenceType:
    | "binding_advice"
    | "job_card"
    | "batch"
    | "dispatch"
    | "invoice";
  timestamp: string;
  notes?: string;
}

export interface InventoryQuantities {
  currentStock: number;
  reservedQuantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  inTransitQuantity: number;
}

class InventoryUpdateService {
  private baseUrl = import.meta.env.BASE_URL;

  /**
   * Reserve inventory when binding advice is created
   */
  async reserveForBindingAdvice(
    bindingAdviceId: string,
    items: Array<{ itemId: string; quantity: number }>
  ) {
    console.log("🔒 Reserving inventory for binding advice:", bindingAdviceId);

    for (const item of items) {
      try {
        // Get current inventory item
        const response = await fetch(
          `${this.baseUrl}/inventory/${item.itemId}`
        );
        const inventoryItem = await response.json();

        if (!inventoryItem) {
          console.error(`❌ Inventory item ${item.itemId} not found`);
          continue;
        }

        // Calculate new quantities
        const currentStock = inventoryItem.currentStock || 0;
        const reservedQuantity =
          (inventoryItem.reservedQuantity || 0) + item.quantity;
        const availableQuantity = Math.max(0, currentStock - reservedQuantity);

        // Check if sufficient stock available
        if (currentStock < item.quantity) {
          console.warn(
            `⚠️ Insufficient stock for ${inventoryItem.itemName}. Available: ${currentStock}, Required: ${item.quantity}`
          );
        }

        // Update inventory with reservation
        const updateData = {
          reservedQuantity,
          availableQuantity,
          updatedAt: new Date().toISOString(),
          reservationHistory: [
            ...(inventoryItem.reservationHistory || []),
            {
              type: "reserve",
              quantity: item.quantity,
              bindingAdviceId,
              date: new Date().toISOString(),
              status: "active",
            },
          ],
        };

        await fetch(`${this.baseUrl}/inventory/${item.itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        console.log(
          `✅ Reserved ${item.quantity} units of ${inventoryItem.itemName}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to reserve inventory for item ${item.itemId}:`,
          error
        );
      }
    }
  }

  /**
   * Release reservation when binding advice is cancelled
   */
  async releaseBindingAdviceReservation(bindingAdviceId: string) {
    console.log(
      "🔓 Releasing reservations for binding advice:",
      bindingAdviceId
    );

    try {
      // Get all inventory items
      const response = await fetch(`${this.baseUrl}/inventory`);
      const allItems = await response.json();

      // Find items with reservations for this binding advice
      const itemsWithReservations = allItems.filter((item: any) =>
        item.reservationHistory?.some(
          (res: any) =>
            res.bindingAdviceId === bindingAdviceId && res.status === "active"
        )
      );

      for (const item of itemsWithReservations) {
        const reservation = item.reservationHistory?.find(
          (res: any) =>
            res.bindingAdviceId === bindingAdviceId && res.status === "active"
        );

        if (reservation) {
          const newReservedQuantity = Math.max(
            0,
            (item.reservedQuantity || 0) - reservation.quantity
          );
          const newAvailableQuantity =
            (item.currentStock || 0) - newReservedQuantity;

          const updateData = {
            reservedQuantity: newReservedQuantity,
            availableQuantity: Math.max(0, newAvailableQuantity),
            updatedAt: new Date().toISOString(),
            reservationHistory: item.reservationHistory?.map((res: any) =>
              res.bindingAdviceId === bindingAdviceId && res.status === "active"
                ? {
                    ...res,
                    status: "released",
                    releasedAt: new Date().toISOString(),
                  }
                : res
            ),
          };

          await fetch(`${this.baseUrl}/inventory/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          });

          console.log(
            `✅ Released ${reservation.quantity} units of ${item.itemName}`
          );
        }
      }
    } catch (error) {
      console.error("❌ Failed to release binding advice reservations:", error);
    }
  }

  /**
   * Convert reservation to allocation when job card is created
   */
  async allocateForJobCard(
    jobCardId: string,
    bindingAdviceId: string,
    items: Array<{ itemId: string; quantity: number }>
  ) {
    console.log("📋 Allocating inventory for job card:", jobCardId);

    for (const item of items) {
      try {
        const response = await fetch(
          `${this.baseUrl}/inventory/${item.itemId}`
        );
        const inventoryItem = await response.json();

        if (!inventoryItem) continue;

        // Update reservation to allocation
        const updateData = {
          allocatedQuantity:
            (inventoryItem.allocatedQuantity || 0) + item.quantity,
          updatedAt: new Date().toISOString(),
          allocationHistory: [
            ...(inventoryItem.allocationHistory || []),
            {
              type: "allocate",
              quantity: item.quantity,
              jobCardId,
              bindingAdviceId,
              date: new Date().toISOString(),
              status: "active",
            },
          ],
        };

        await fetch(`${this.baseUrl}/inventory/${item.itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        console.log(
          `✅ Allocated ${item.quantity} units of ${inventoryItem.itemName} to job card`
        );
      } catch (error) {
        console.error(
          `❌ Failed to allocate inventory for item ${item.itemId}:`,
          error
        );
      }
    }
  }

  /**
   * Consume inventory when production is completed
   */
  async consumeForProduction(
    jobCardId: string,
    items: Array<{ itemId: string; quantity: number }>
  ) {
    console.log("🏭 Consuming inventory for production:", jobCardId);

    for (const item of items) {
      try {
        const response = await fetch(
          `${this.baseUrl}/inventory/${item.itemId}`
        );
        const inventoryItem = await response.json();

        if (!inventoryItem) continue;

        // Reduce current stock and clear allocations
        const newCurrentStock = Math.max(
          0,
          (inventoryItem.currentStock || 0) - item.quantity
        );
        const newAllocatedQuantity = Math.max(
          0,
          (inventoryItem.allocatedQuantity || 0) - item.quantity
        );
        const newAvailableQuantity =
          newCurrentStock - (inventoryItem.reservedQuantity || 0);

        const updateData = {
          currentStock: newCurrentStock,
          allocatedQuantity: newAllocatedQuantity,
          availableQuantity: Math.max(0, newAvailableQuantity),
          updatedAt: new Date().toISOString(),
          consumptionHistory: [
            ...(inventoryItem.consumptionHistory || []),
            {
              type: "production",
              quantity: item.quantity,
              jobCardId,
              date: new Date().toISOString(),
              reason: "Production consumption",
            },
          ],
        };

        await fetch(`${this.baseUrl}/inventory/${item.itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        console.log(
          `✅ Consumed ${item.quantity} units of ${inventoryItem.itemName} for production`
        );
      } catch (error) {
        console.error(
          `❌ Failed to consume inventory for item ${item.itemId}:`,
          error
        );
      }
    }
  }

  /**
   * Add finished products to inventory when production is completed
   */
  async addFinishedProducts(
    jobCardId: string,
    items: Array<{ itemId: string; quantity: number }>
  ) {
    console.log("📦 Adding finished products to inventory:", jobCardId);

    for (const item of items) {
      try {
        const response = await fetch(
          `${this.baseUrl}/inventory/${item.itemId}`
        );
        const inventoryItem = await response.json();

        if (!inventoryItem) continue;

        // Increase current stock and available quantity
        const newCurrentStock =
          (inventoryItem.currentStock || 0) + item.quantity;
        const newAvailableQuantity =
          newCurrentStock - (inventoryItem.reservedQuantity || 0);

        const updateData = {
          currentStock: newCurrentStock,
          availableQuantity: Math.max(0, newAvailableQuantity),
          lastProduced: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString(),
          productionHistory: [
            ...(inventoryItem.productionHistory || []),
            {
              type: "production_complete",
              quantity: item.quantity,
              jobCardId,
              date: new Date().toISOString(),
              productionCost: inventoryItem.productionCost || 0,
            },
          ],
        };

        await fetch(`${this.baseUrl}/inventory/${item.itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        console.log(
          `✅ Added ${item.quantity} units of ${inventoryItem.itemName} to finished products`
        );
      } catch (error) {
        console.error(
          `❌ Failed to add finished products for item ${item.itemId}:`,
          error
        );
      }
    }
  }

  /**
   * Update inventory when products are dispatched
   */
  async dispatchProducts(
    dispatchId: string,
    items: Array<{ itemId: string; quantity: number }>
  ) {
    console.log("🚚 Dispatching products:", dispatchId);

    for (const item of items) {
      try {
        const response = await fetch(
          `${this.baseUrl}/inventory/${item.itemId}`
        );
        const inventoryItem = await response.json();

        if (!inventoryItem) continue;

        // Reduce current stock and available quantity
        const newCurrentStock = Math.max(
          0,
          (inventoryItem.currentStock || 0) - item.quantity
        );
        const newAvailableQuantity = Math.max(
          0,
          newCurrentStock - (inventoryItem.reservedQuantity || 0)
        );

        const updateData = {
          currentStock: newCurrentStock,
          availableQuantity: newAvailableQuantity,
          inTransitQuantity:
            (inventoryItem.inTransitQuantity || 0) + item.quantity,
          updatedAt: new Date().toISOString(),
          dispatchHistory: [
            ...(inventoryItem.dispatchHistory || []),
            {
              type: "dispatch",
              quantity: item.quantity,
              dispatchId,
              date: new Date().toISOString(),
              status: "in_transit",
            },
          ],
        };

        await fetch(`${this.baseUrl}/inventory/${item.itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        console.log(
          `✅ Dispatched ${item.quantity} units of ${inventoryItem.itemName}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to dispatch inventory for item ${item.itemId}:`,
          error
        );
      }
    }
  }

  /**
   * Update inventory when products are delivered
   */
  async deliverProducts(
    dispatchId: string,
    items: Array<{ itemId: string; quantity: number }>
  ) {
    console.log("📋 Delivering products:", dispatchId);

    for (const item of items) {
      try {
        const response = await fetch(
          `${this.baseUrl}/inventory/${item.itemId}`
        );
        const inventoryItem = await response.json();

        if (!inventoryItem) continue;

        // Reduce in-transit quantity
        const newInTransitQuantity = Math.max(
          0,
          (inventoryItem.inTransitQuantity || 0) - item.quantity
        );

        const updateData = {
          inTransitQuantity: newInTransitQuantity,
          updatedAt: new Date().toISOString(),
          deliveryHistory: [
            ...(inventoryItem.deliveryHistory || []),
            {
              type: "delivery",
              quantity: item.quantity,
              dispatchId,
              date: new Date().toISOString(),
              status: "delivered",
            },
          ],
        };

        await fetch(`${this.baseUrl}/inventory/${item.itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        console.log(
          `✅ Delivered ${item.quantity} units of ${inventoryItem.itemName}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to deliver inventory for item ${item.itemId}:`,
          error
        );
      }
    }
  }

  /**
   * Get comprehensive inventory status
   */
  async getInventoryStatus(
    itemId: string
  ): Promise<InventoryQuantities | null> {
    try {
      const response = await fetch(`${this.baseUrl}/inventory/${itemId}`);
      const item = await response.json();

      if (!item) return null;

      return {
        currentStock: item.currentStock || 0,
        reservedQuantity: item.reservedQuantity || 0,
        availableQuantity: item.availableQuantity || 0,
        allocatedQuantity: item.allocatedQuantity || 0,
        inTransitQuantity: item.inTransitQuantity || 0,
      };
    } catch (error) {
      console.error(
        `❌ Failed to get inventory status for item ${itemId}:`,
        error
      );
      return null;
    }
  }
}

export const inventoryUpdateService = new InventoryUpdateService();
