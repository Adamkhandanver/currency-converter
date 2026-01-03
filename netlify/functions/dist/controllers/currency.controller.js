"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyController = void 0;
const common_1 = require("@nestjs/common");
const currency_service_1 = require("../services/currency.service");
let CurrencyController = class CurrencyController {
    currencyService;
    constructor(currencyService) {
        this.currencyService = currencyService;
    }
    async getStatus() {
        try {
            return await this.currencyService.getStatus();
        }
        catch (error) {
            throw new common_1.HttpException('Failed to get API status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCurrencies(currencies) {
        try {
            const currenciesArray = currencies ? currencies.split(',') : undefined;
            return await this.currencyService.getCurrencies(currenciesArray);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to get currencies', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getLatestRates(baseCurrency, currencies) {
        try {
            const currenciesArray = currencies ? currencies.split(',') : undefined;
            return await this.currencyService.getLatestExchangeRates(baseCurrency, currenciesArray);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to get latest exchange rates', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getHistoricalRates(date, baseCurrency, currencies) {
        try {
            if (!date) {
                throw new common_1.HttpException('Date parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                throw new common_1.HttpException('Date must be in YYYY-MM-DD format', common_1.HttpStatus.BAD_REQUEST);
            }
            const currenciesArray = currencies ? currencies.split(',') : undefined;
            return await this.currencyService.getHistoricalRates(date, baseCurrency, currenciesArray);
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Failed to get historical rates', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async convert(from, to, amount, date) {
        try {
            if (!from || !to) {
                throw new common_1.HttpException('From and to parameters are required', common_1.HttpStatus.BAD_REQUEST);
            }
            const amountNumber = amount ? parseFloat(amount) : 1;
            if (amount && (isNaN(amountNumber) || amountNumber <= 0)) {
                throw new common_1.HttpException('Amount must be a positive number', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.currencyService.convertCurrency(from, to, amountNumber, date);
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Failed to convert currency', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getHistory() {
        try {
            return await this.currencyService.getConversionHistory();
        }
        catch (error) {
            throw new common_1.HttpException('Failed to get conversion history', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CurrencyController = CurrencyController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('currencies'),
    __param(0, (0, common_1.Query)('currencies')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getCurrencies", null);
__decorate([
    (0, common_1.Get)('latest'),
    __param(0, (0, common_1.Query)('base')),
    __param(1, (0, common_1.Query)('currencies')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getLatestRates", null);
__decorate([
    (0, common_1.Get)('historical'),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('base')),
    __param(2, (0, common_1.Query)('currencies')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getHistoricalRates", null);
__decorate([
    (0, common_1.Get)('convert'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('amount')),
    __param(3, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "convert", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getHistory", null);
exports.CurrencyController = CurrencyController = __decorate([
    (0, common_1.Controller)('currency'),
    __metadata("design:paramtypes", [currency_service_1.CurrencyService])
], CurrencyController);
//# sourceMappingURL=currency.controller.js.map