Select
    action_logs.action_type,
    users.first_name,
    users.middle_name,
    users.last_name,
    users.email,
    action_logs.created_at,
    assets.asset_tag,
    assets.model
From
    action_logs Inner Join
    users On action_logs.user_id = users.id Inner Join
    employees On users.employee_id = employees.id Inner Join
    assignments On assignments.employee_id = employees.id Inner Join
    assets On assignments.asset_id = assets.id
Where
    action_logs.action_type = 'ASSIGN ASSET' And
    assets.asset_tag = 'ICT-LPT-001'
Order By
    action_logs.created_at Desc