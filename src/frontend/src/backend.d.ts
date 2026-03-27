import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface http_header {
    value: string;
    name: string;
}
export interface ProductDTO {
    id: bigint;
    name: string;
    priceInPaise: bigint;
    description: string;
    isActive: boolean;
    imageUrl?: string;
    isFeatured: boolean;
    category: string;
    salesCount: bigint;
    fileUrl?: string;
}
export interface Product {
    id: bigint;
    name: string;
    priceInPaise: bigint;
    description: string;
    isActive: boolean;
    imageUrl: ExternalBlob;
    isFeatured: boolean;
    category: string;
    salesCount: bigint;
    fileUrl: ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface OrderDTO {
    id: bigint;
    paymentStatus: string;
    productIds: Array<bigint>;
    createdAt: bigint;
    cashfreeOrderId: string;
    totalAmount: bigint;
    buyerPrincipal: Principal;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCashfreePaymentLink(orderId: bigint, amount: bigint, customerEmail: string, callbackUrl: string): Promise<string>;
    createOrder(productIds: Array<bigint>, totalAmount: bigint, cashfreeOrderId: string): Promise<bigint>;
    deleteProduct(productId: bigint): Promise<void>;
    getAdminStats(): Promise<{
        totalProducts: bigint;
        totalOrders: bigint;
        pendingOrders: bigint;
        totalRevenue: bigint;
    }>;
    getAllOrders(): Promise<Array<OrderDTO>>;
    getAllProductsByCategory(category: string): Promise<Array<ProductDTO>>;
    getCallerUserRole(): Promise<UserRole>;
    getDownloadUrl(orderId: bigint, productId: bigint): Promise<string | null>;
    getFeaturedProducts(): Promise<Array<ProductDTO>>;
    getMyOrders(): Promise<Array<OrderDTO>>;
    getOrder(orderId: bigint): Promise<OrderDTO>;
    getProduct(productId: bigint): Promise<ProductDTO>;
    getProducts(): Promise<Array<ProductDTO>>;
    getTopSellers(limit: bigint): Promise<Array<ProductDTO>>;
    isCallerAdmin(): Promise<boolean>;
    searchProducts(queryText: string, category: string): Promise<Array<ProductDTO>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePaymentStatus(orderId: bigint, status: string): Promise<void>;
    updateProduct(productId: bigint, product: Product): Promise<void>;
    verifyPaymentStatus(cashfreeOrderId: string): Promise<string>;
}
