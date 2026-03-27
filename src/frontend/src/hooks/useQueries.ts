import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "../backend";
import type { OrderDTO, ProductDTO } from "../backend.d";
import { useActor } from "./useActor";

export function useGetProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<ProductDTO[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeaturedProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<ProductDTO[]>({
    queryKey: ["featured-products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTopSellers() {
  const { actor, isFetching } = useActor();
  return useQuery<ProductDTO[]>({
    queryKey: ["top-sellers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopSellers(4n);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchProducts(query: string, category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ProductDTO[]>({
    queryKey: ["search-products", query, category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProducts(query, category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderDTO[]>({
    queryKey: ["all-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderDTO[]>({
    queryKey: ["my-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productIds,
      totalAmount,
    }: {
      productIds: bigint[];
      totalAmount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrder(productIds, totalAmount, "pending");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}

export function useCreatePaymentLink() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      orderId,
      amount,
      email,
      callbackUrl,
    }: {
      orderId: bigint;
      amount: bigint;
      email: string;
      callbackUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCashfreePaymentLink(
        orderId,
        amount,
        email,
        callbackUrl,
      );
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(product);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      product,
    }: {
      productId: bigint;
      product: Product;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(productId, product);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: bigint;
      status: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePaymentStatus(orderId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-orders"] });
    },
  });
}

export function useGetDownloadUrl() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      orderId,
      productId,
    }: {
      orderId: bigint;
      productId: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.getDownloadUrl(orderId, productId);
    },
  });
}
