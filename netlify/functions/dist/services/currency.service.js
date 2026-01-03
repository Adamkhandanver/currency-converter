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
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const axios_2 = require("axios");
const conversion_entity_1 = require("../entities/conversion.entity");
let CurrencyService = class CurrencyService {
    httpService;
    conversionRepository;
    baseUrl = 'https://api.freecurrencyapi.com/v1/';
    apiKey = '4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2';
    constructor(httpService, conversionRepository) {
        this.httpService = httpService;
        this.conversionRepository = conversionRepository;
    }
    getHeaders() {
        return {
            apikey: this.apiKey,
            'Accept': 'application/json',
        };
    }
    async call(endpoint, params = {}) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}${endpoint}`, {
                headers: this.getHeaders(),
                params,
                timeout: 10000,
            }));
            return response.data;
        }
        catch (error) {
            console.error('Currency API Error:', error.message);
            if (error instanceof axios_2.AxiosError) {
                if (error.response?.status === 401) {
                    throw new common_1.HttpException('Invalid API Key', common_1.HttpStatus.UNAUTHORIZED);
                }
                if (error.response?.status === 429) {
                    throw new common_1.HttpException('API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
                }
                if (error.code === 'ECONNABORTED') {
                    throw new common_1.HttpException('Request timeout', common_1.HttpStatus.REQUEST_TIMEOUT);
                }
            }
            throw new common_1.HttpException('Failed to fetch currency data from external API', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStatus() {
        return this.call('status');
    }
    async getCurrencies(currencies) {
        const params = {};
        if (currencies && currencies.length > 0) {
            params.currencies = currencies;
        }
        return this.call('currencies', params);
    }
    async getLatestExchangeRates(baseCurrency, targetCurrencies) {
        const params = {};
        if (baseCurrency) {
            if (baseCurrency.length !== 3) {
                throw new common_1.HttpException('Base currency must be a 3-letter code', common_1.HttpStatus.BAD_REQUEST);
            }
            params.base_currency = baseCurrency.toUpperCase();
        }
        if (targetCurrencies && targetCurrencies.length > 0) {
            targetCurrencies = targetCurrencies.map(c => {
                if (c.length !== 3) {
                    throw new common_1.HttpException(`Invalid currency code: ${c}`, common_1.HttpStatus.BAD_REQUEST);
                }
                return c.toUpperCase();
            });
            params.currencies = targetCurrencies;
        }
        return this.call('latest', params);
    }
    async getHistoricalRates(date, baseCurrency, targetCurrencies) {
        const params = { date };
        if (baseCurrency) {
            if (baseCurrency.length !== 3) {
                throw new common_1.HttpException('Base currency must be a 3-letter code', common_1.HttpStatus.BAD_REQUEST);
            }
            params.base_currency = baseCurrency.toUpperCase();
        }
        if (targetCurrencies && targetCurrencies.length > 0) {
            targetCurrencies = targetCurrencies.map(c => {
                if (c.length !== 3) {
                    throw new common_1.HttpException(`Invalid currency code: ${c}`, common_1.HttpStatus.BAD_REQUEST);
                }
                return c.toUpperCase();
            });
            params.currencies = targetCurrencies;
        }
        return this.call('historical', params);
    }
    async convertCurrency(from, to, amount = 1, date) {
        if (from.length !== 3) {
            throw new common_1.HttpException('From currency must be a 3-letter code', common_1.HttpStatus.BAD_REQUEST);
        }
        if (to.length !== 3) {
            throw new common_1.HttpException('To currency must be a 3-letter code', common_1.HttpStatus.BAD_REQUEST);
        }
        if (amount <= 0) {
            throw new common_1.HttpException('Amount must be positive', common_1.HttpStatus.BAD_REQUEST);
        }
        let result;
        let usedDate = date || new Date().toISOString().split('T')[0];
        if (date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                throw new common_1.HttpException('Date must be in YYYY-MM-DD format', common_1.HttpStatus.BAD_REQUEST);
            }
            result = await this.getHistoricalRates(date, from.toUpperCase(), [to.toUpperCase()]);
        }
        else {
            result = await this.getLatestExchangeRates(from.toUpperCase(), [to.toUpperCase()]);
        }
        if (!result.data || !result.data[to.toUpperCase()]) {
            throw new common_1.HttpException('Exchange rate not found', common_1.HttpStatus.NOT_FOUND);
        }
        const rate = result.data[to.toUpperCase()];
        const convertedResult = amount * rate;
        const conversion = this.conversionRepository.create({
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            amount,
            rate,
            result: convertedResult,
            date: usedDate,
        });
        await this.conversionRepository.save(conversion);
        return {
            success: true,
            query: {
                from: from.toUpperCase(),
                to: to.toUpperCase(),
                amount,
                date: usedDate,
            },
            info: {
                rate,
                timestamp: result.meta?.last_updated_at || new Date().toISOString(),
            },
            result: convertedResult,
            date: usedDate,
        };
    }
    async getConversionHistory() {
        return this.conversionRepository.find({
            order: { timestamp: 'DESC' },
        });
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(conversion_entity_1.Conversion)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        typeorm_2.Repository])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map