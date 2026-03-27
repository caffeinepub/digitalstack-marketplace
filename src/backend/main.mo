import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
    public func compareBySalesCountDescending(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product2.salesCount, product1.salesCount);
    };
  };

  module OrderEntry {
    public func compare(order1 : OrderEntry, order2 : OrderEntry) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };
    public func compareByCreatedAtDescending(order1 : OrderEntry, order2 : OrderEntry) : Order.Order {
      Int.compare(order2.createdAt, order1.createdAt);
    };
  };

  module OrderEntries {
    public func filterByPrincipal(array : [OrderEntry], principal : Principal) : [OrderEntry] {
      array.filter(
        func(order) {
          order.buyerPrincipal == principal
        }
      );
    };
  };

  module Products {
    public func contains(productIds : [Nat], productId : Nat) : Bool {
      switch (productIds.find(func(id) { id == productId })) {
        case (?_id) { true };
        case (null) { false };
      };
    };
  };

  include MixinStorage();

  // TYPES
  type PaymentStatus = {
    #pending;
    #paid;
    #failed;
  };

  type PaymentStatusInfo = {
    cashfreeOrderId : Text;
    paymentStatus : PaymentStatus;
  };

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    priceInPaise : Nat;
    category : Text;
    imageUrl : Storage.ExternalBlob;
    fileUrl : Storage.ExternalBlob;
    isFeatured : Bool;
    salesCount : Nat;
    isActive : Bool;
  };

  type ProductDTO = {
    id : Nat;
    name : Text;
    description : Text;
    priceInPaise : Nat;
    category : Text;
    imageUrl : ?Text;
    fileUrl : ?Text;
    isFeatured : Bool;
    salesCount : Nat;
    isActive : Bool;
  };

  type OrderEntry = {
    id : Nat;
    buyerPrincipal : Principal;
    productIds : [Nat];
    totalAmount : Nat;
    cashfreeOrderId : Text;
    paymentStatus : PaymentStatus;
    createdAt : Int;
  };

  public type OrderDTO = {
    id : Nat;
    buyerPrincipal : Principal;
    productIds : [Nat];
    totalAmount : Nat;
    cashfreeOrderId : Text;
    paymentStatus : Text;
    createdAt : Int;
  };

  // STATE
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, OrderEntry>();
  let cashfreePayments = Map.empty<Text, PaymentStatusInfo>();
  var nextProductId = 0;
  var nextOrderId = 0;

  // AUTH
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // PRODUCT METHODS
  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let productId = nextProductId + 1;
    nextProductId := productId;
    let newProduct = {
      product with
      id = productId;
    };
    products.add(productId, newProduct);
    productId;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, product : Product) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (not products.containsKey(productId)) { Runtime.trap("Product not found") };
    products.add(productId, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  func productToDTO(product : Product) : ProductDTO {
    {
      product with
      imageUrl = null;
      fileUrl = null;
    };
  };

  func getProductInternal(productId : Nat) : Product {
    switch (products.get(productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ProductDTO {
    let product = getProductInternal(productId);
    productToDTO(product);
  };

  public query ({ caller }) func getProducts() : async [ProductDTO] {
    products.values().toArray().sort().map(productToDTO);
  };

  public query ({ caller }) func getFeaturedProducts() : async [ProductDTO] {
    products.values().toArray().filter(
      func(product) { product.isFeatured }
    ).map(productToDTO);
  };

  public query ({ caller }) func getTopSellers(limit : Nat) : async [ProductDTO] {
    products.values().toArray().sort(Product.compareBySalesCountDescending).sliceToArray(0, limit).map(productToDTO);
  };

  public query ({ caller }) func searchProducts(queryText : Text, category : Text) : async [ProductDTO] {
    products.values().toArray().filter(
      func(product) {
        product.name.contains(#text queryText) and product.category.contains(#text category);
      }
    ).map(productToDTO);
  };

  public query ({ caller }) func getAllProductsByCategory(category : Text) : async [ProductDTO] {
    products.values().toArray().filter(
      func(product) {
        product.category.contains(#text category);
      }
    ).map(productToDTO);
  };

  // ORDER METHODS
  public shared ({ caller }) func createOrder(productIds : [Nat], totalAmount : Nat, cashfreeOrderId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create orders");
    };
    let orderId = nextOrderId + 1;
    nextOrderId := orderId;
    let order : OrderEntry = {
      id = orderId;
      buyerPrincipal = caller;
      productIds;
      totalAmount;
      cashfreeOrderId;
      paymentStatus = #pending;
      createdAt = Time.now();
    };
    orders.add(orderId, order);
    orderId;
  };

  func getOrderInternal(orderId : Nat) : OrderEntry {
    switch (orders.get(orderId)) {
      case (?order) { order };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  func orderToDTO(order : OrderEntry) : OrderDTO {
    {
      order with
      paymentStatus = switch (order.paymentStatus) {
        case (#pending) { "pending" };
        case (#paid) { "paid" };
        case (#failed) { "failed" };
      };
    };
  };

  public shared ({ caller }) func getOrder(orderId : Nat) : async OrderDTO {
    let order = getOrderInternal(orderId);
    if (order.buyerPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own orders");
    };
    orderToDTO(order);
  };

  public query ({ caller }) func getMyOrders() : async [OrderDTO] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    orders.values().toArray().filter(
      func(order) { order.buyerPrincipal == caller }
    ).map(orderToDTO);
  };

  public query ({ caller }) func getAllOrders() : async [OrderDTO] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray().sort(OrderEntry.compareByCreatedAtDescending).map(orderToDTO);
  };

  public shared ({ caller }) func updatePaymentStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update payment status");
    };
    let order = getOrderInternal(orderId);
    let newOrder : OrderEntry = {
      order with
      paymentStatus = switch (status) {
        case ("pending") { #pending };
        case ("paid") { #paid };
        case ("failed") { #failed };
        case (_) { #pending };
      };
    };
    orders.add(orderId, newOrder);
  };

  // DOWNLOAD ACCESS
  public shared ({ caller }) func getDownloadUrl(orderId : Nat, productId : Nat) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access downloads");
    };
    let order = getOrderInternal(orderId);
    if (order.buyerPrincipal != caller) { return null };
    if (order.paymentStatus != #paid) { return null };
    if (not Products.contains(order.productIds, productId)) { return null };
    let product = getProductInternal(productId);
    null;
  };

  // ADMIN STATS
  public query ({ caller }) func getAdminStats() : async {
    totalRevenue : Nat;
    totalOrders : Nat;
    totalProducts : Nat;
    pendingOrders : Nat;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };
    let totalRevenue = orders.values().toArray().foldLeft(
      0,
      func(acc, order) {
        if (order.paymentStatus == #paid) {
          acc + order.totalAmount;
        } else {
          acc;
        };
      },
    );
    let pendingOrders = orders.values().toArray().filter(
      func(order) { order.paymentStatus == #pending }
    );
    {
      totalRevenue;
      totalOrders = orders.size();
      totalProducts = products.size();
      pendingOrders = pendingOrders.size();
    };
  };

  // PAYMENT INTEGRATION
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  type CreatePaymentLinkPayload = {
    orderId : Nat;
    amount : Nat;
    customerEmail : Text;
    callbackUrl : Text;
  };
  func createPaymentLinkPayload(orderId : Nat, amount : Nat, customerEmail : Text, callbackUrl : Text) : Text {
    let payload : CreatePaymentLinkPayload = {
      orderId;
      amount;
      customerEmail;
      callbackUrl;
    };
    "{\"orderId\": " # orderId.toText() # ", \"amount\": " # amount.toText() # ", \"customer_email\": \"" # customerEmail # "\", " # "\"callback_url\": \"" # callbackUrl # "\"}";
  };

  public shared ({ caller }) func createCashfreePaymentLink(orderId : Nat, amount : Nat, customerEmail : Text, callbackUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create payment links");
    };
    let order = getOrderInternal(orderId);
    if (order.buyerPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only create payment links for your own orders");
    };
    let url = "https://sandbox.cashfree.com/api/v1/links";
    let payload = createPaymentLinkPayload(orderId, amount, customerEmail, callbackUrl);
    await OutCall.httpPostRequest(url, [], payload, transform);
  };

  public shared ({ caller }) func verifyPaymentStatus(cashfreeOrderId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can verify payment status");
    };
    let url = "https://sandbox.cashfree.com/api/v1/links?cf_link_id=" # cashfreeOrderId;
    await OutCall.httpGetRequest(url, [], transform);
  };
};
