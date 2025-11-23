module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/mongoose [external] (mongoose, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongoose", () => require("mongoose"));

module.exports = mod;
}),
"[project]/src/lib/mongodb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dbConnect",
    ()=>dbConnect
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/FDS";
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
let isConnected = false;
async function dbConnect() {
    if (isConnected) return;
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connect(MONGODB_URI);
        isConnected = true;
        console.log("✅MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error", error);
        throw error;
    }
}
}),
"[project]/src/Models/Transaction.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
// inline enums (was imported from './enums')
var TypeTransaction = /*#__PURE__*/ function(TypeTransaction) {
    TypeTransaction["OTHER"] = "OTHER";
    TypeTransaction["TRANSFER"] = "TRANSFER";
    TypeTransaction["PAYMENT"] = "PAYMENT";
    TypeTransaction["WITHDRAWAL"] = "WITHDRAWAL";
    TypeTransaction["DEPOSIT"] = "DEPOSIT";
    return TypeTransaction;
}(TypeTransaction || {});
var StatutTransaction = /*#__PURE__*/ function(StatutTransaction) {
    StatutTransaction["EN_ATTENTE"] = "EN_ATTENTE";
    StatutTransaction["VALIDE"] = "VALIDE";
    StatutTransaction["REJETE"] = "REJETE";
    return StatutTransaction;
}(StatutTransaction || {});
const TransactionSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].Schema({
    idTransaction: {
        type: Number
    },
    step: {
        type: Number,
        default: 0
    },
    user: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].Schema.Types.ObjectId,
        ref: 'User'
    },
    compteSource: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].Schema.Types.ObjectId,
        ref: 'Compte'
    },
    compteDestination: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].Schema.Types.ObjectId,
        ref: 'Compte'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(TypeTransaction),
        default: "OTHER"
    },
    channel: {
        type: String,
        enum: [
            'online',
            'branch',
            'atm',
            'pos',
            'mobile'
        ],
        default: 'online'
    },
    statut: {
        type: String,
        enum: Object.values(StatutTransaction),
        default: "EN_ATTENTE"
    },
    isFraud: {
        type: Boolean,
        default: false
    },
    riskScore: {
        type: Number,
        default: 0
    },
    mlDetails: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].Schema.Types.Mixed
    },
    description: {
        type: String
    },
    balanceAfterSource: {
        type: Number
    },
    balanceAfterDestination: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// helpers
// TransactionSchema.methods.markAsFraud = function(score, details){
//   this.isFraud = true;
//   this.riskScore = score || this.riskScore;
//   if(details) this.mlDetails = Object.assign(this.mlDetails || {}, details);
//   return this.save();
// };
const Transaction = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model('Transaction', TransactionSchema);
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.Transaction || Transaction;
}),
"[project]/src/app/api/Client/Transaction/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Models$2f$Transaction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Models/Transaction.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dbConnect"])();
        const { date, amount, type, channel, description, balanceAfter, compteSource, compteDestination } = await req.json();
        if (!date || !amount || !type || !channel) {
            return new Response(JSON.stringify({
                error: "Missing required fields"
            }), {
                status: 400
            });
        }
        const newTransaction = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Models$2f$Transaction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
            date,
            amount,
            type,
            channel,
            description,
            balanceAfter,
            compteSource,
            compteDestination
        });
        await newTransaction.save();
        return new Response(JSON.stringify({
            message: "Transaction created successfully"
        }), {
            status: 201
        });
    } catch (error) {
        console.error("Transaction error:", error);
        return new Response(JSON.stringify({
            error: "Something went wrong",
            details: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__afd85a39._.js.map