import pytest

from cogs5e.models import automation
from cogs5e.models.sheet.attack import Attack, normalize_save_stat


def test_attack_new_save_for_half_damage():
    attack = Attack.new(
        "Poison Breath",
        damage_calc="2d6[poison]",
        save="constitution",
        dc="{spell}",
        success_damage="(2d6[poison])/2",
    )

    assert len(attack.automation.effects) == 1
    target = attack.automation.effects[0]
    assert isinstance(target, automation.Target)
    assert target.target == "each"

    save = target.effects[0]
    assert isinstance(save, automation.Save)
    assert save.stat == "con"
    assert save.dc == "{spell}"
    assert len(save.fail) == 1
    assert save.fail[0].damage == "2d6[poison]"
    assert len(save.success) == 1
    assert save.success[0].damage == "(2d6[poison])/2"


def test_attack_new_save_without_half_damage():
    attack = Attack.new("Poison Breath", damage_calc="2d6[poison]", save="con", dc="{spell}")

    save = attack.automation.effects[0].effects[0]
    assert save.stat == "con"
    assert save.fail[0].damage == "2d6[poison]"
    assert save.success == []


def test_attack_new_save_without_damage():
    attack = Attack.new("Frightful Presence", save="wis", dc="15")

    save = attack.automation.effects[0].effects[0]
    assert save.stat == "wis"
    assert save.dc == "15"
    assert save.fail == []
    assert save.success == []


def test_attack_new_rejects_invalid_save():
    with pytest.raises(ValueError, match="not a valid save stat"):
        Attack.new("Bad Save", damage_calc="1d6", save="fortitude", dc="15")


@pytest.mark.parametrize(
    ("raw_save", "expected"),
    [("str", "str"), ("Strength", "str"), ("DEXTERITY", "dex"), ("charisma", "cha")],
)
def test_normalize_save_stat_accepts_abbreviations_and_full_names(raw_save, expected):
    assert normalize_save_stat(raw_save) == expected
