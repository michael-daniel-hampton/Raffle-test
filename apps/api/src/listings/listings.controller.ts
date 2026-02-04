import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ListingStatus } from "@prisma/client";
import { AuthGuard, AuthUser } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { CreateListingDto } from "./dto/create-listing.dto";
import { PurchaseTicketsDto } from "./dto/purchase-tickets.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { ListingsService } from "./listings.service";

@Controller("v1/listings")
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @UseGuards(AuthGuard)
  @Post()
  createListing(@CurrentUser() user: AuthUser, @Body() dto: CreateListingDto) {
    return this.listings.createListing(user.aliasId, dto);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  updateListing(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateListingDto) {
    return this.listings.updateListing(user.aliasId, id, dto);
  }

  @UseGuards(AuthGuard)
  @Post(":id/activate")
  activateListing(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.listings.activateListing(user.aliasId, user.kycVerified, id);
  }

  @Get()
  listListings(@Query("status") status?: ListingStatus) {
    return this.listings.listListings(status ?? ListingStatus.ACTIVE);
  }

  @UseGuards(AuthGuard)
  @Get("seller/me")
  listSellerListings(@CurrentUser() user: AuthUser) {
    return this.listings.listSellerListings(user.aliasId);
  }

  @Get(":id")
  getListing(@Param("id") id: string) {
    return this.listings.getListing(id);
  }

  @UseGuards(AuthGuard)
  @Post(":id/tickets/purchase")
  purchaseTickets(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: PurchaseTicketsDto,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    return this.listings.purchaseTickets(user.aliasId, id, dto, idempotencyKey);
  }
}
