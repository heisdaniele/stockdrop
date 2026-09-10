// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title StockDropVault
/// @notice A shared primitive for time-locked stock gifts and instantly claimable rewards.
contract StockDropVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_MEMO_BYTES = 280;

    struct Drop {
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint64 unlockTime;
        bool claimed;
        string memo;
    }

    uint256 public nextDropId;
    mapping(uint256 dropId => Drop drop) private _drops;
    mapping(address recipient => uint256[] dropIds) private _recipientDropIds;
    mapping(address sender => uint256[] dropIds) private _senderDropIds;

    error InvalidRecipient();
    error InvalidToken();
    error InvalidAmount();
    error InvalidUnlockTime();
    error MemoTooLong();
    error UnsupportedTransferFee();
    error DropNotFound();
    error NotRecipient();
    error AlreadyClaimed();
    error DropLocked(uint64 unlockTime);

    event DropCreated(uint256 indexed dropId, address indexed sender, address indexed recipient, address token, uint256 amount, uint64 unlockTime, string memo);
    event DropClaimed(uint256 indexed dropId, address indexed recipient, address indexed token, uint256 amount);

    function createDrop(address recipient, address token, uint256 amount, uint64 unlockTime, string calldata memo)
        external
        nonReentrant
        returns (uint256 dropId)
    {
        if (recipient == address(0)) revert InvalidRecipient();
        if (token == address(0) || token.code.length == 0) revert InvalidToken();
        if (amount == 0) revert InvalidAmount();
        if (unlockTime != 0 && unlockTime < block.timestamp) revert InvalidUnlockTime();
        if (bytes(memo).length > MAX_MEMO_BYTES) revert MemoTooLong();

        IERC20 asset = IERC20(token);
        uint256 balanceBefore = asset.balanceOf(address(this));
        asset.safeTransferFrom(msg.sender, address(this), amount);
        if (asset.balanceOf(address(this)) - balanceBefore != amount) revert UnsupportedTransferFee();

        uint64 effectiveUnlockTime = unlockTime == 0 ? uint64(block.timestamp) : unlockTime;
        dropId = nextDropId++;
        _drops[dropId] = Drop(msg.sender, recipient, token, amount, effectiveUnlockTime, false, memo);
        _recipientDropIds[recipient].push(dropId);
        _senderDropIds[msg.sender].push(dropId);
        emit DropCreated(dropId, msg.sender, recipient, token, amount, effectiveUnlockTime, memo);
    }

    function claim(uint256 dropId) external nonReentrant {
        Drop storage drop = _drops[dropId];
        if (drop.sender == address(0)) revert DropNotFound();
        if (msg.sender != drop.recipient) revert NotRecipient();
        if (drop.claimed) revert AlreadyClaimed();
        if (block.timestamp < drop.unlockTime) revert DropLocked(drop.unlockTime);

        drop.claimed = true;
        IERC20(drop.token).safeTransfer(drop.recipient, drop.amount);
        emit DropClaimed(dropId, drop.recipient, drop.token, drop.amount);
    }

    function getDrop(uint256 dropId) external view returns (Drop memory) {
        Drop memory drop = _drops[dropId];
        if (drop.sender == address(0)) revert DropNotFound();
        return drop;
    }

    function recipientDropIds(address recipient) external view returns (uint256[] memory) { return _recipientDropIds[recipient]; }
    function senderDropIds(address sender) external view returns (uint256[] memory) { return _senderDropIds[sender]; }
}
