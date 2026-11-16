# Atomic Lua scripts for Redis distributed stock locking

RESERVE_STOCK_LUA = """
local current_stock = tonumber(redis.call('get', KEYS[1]))
if not current_stock then
    return -1
end

local requested_qty = tonumber(ARGV[1])
if current_stock >= requested_qty then
    redis.call('decrby', KEYS[1], requested_qty)
    redis.call('set', KEYS[2], requested_qty, 'EX', tonumber(ARGV[2]))
    return 1
else
    return 0
end
"""

RELEASE_STOCK_LUA = """
local reserved_qty = tonumber(redis.call('get', KEYS[2]))
if reserved_qty then
    redis.call('incrby', KEYS[1], reserved_qty)
    redis.call('del', KEYS[2])
    return 1
end
return 0
"""

COMMIT_STOCK_LUA = """
return redis.call('del', KEYS[1])
"""
